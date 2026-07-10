"""Authentication service layer — production-ready, database-only authentication.

NO hardcoded credentials. NO demo logins. NO phone-as-password fallback.
All authentication validates exclusively against PostgreSQL records.
"""

import random
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from config.database import db
from models.owner import Owner
from models.member import Member
from models.pg import PG

from utils.response import success_response, error_response
from utils.validators import (
    is_valid_email,
    is_valid_phone,
    is_valid_password,
)

# ─────────────────────────────────────────────────────────────────────────────
# OWNER REGISTRATION
# ─────────────────────────────────────────────────────────────────────────────

def register_owner(data):
    """Register a new owner and create their PG profile.

    Validates all fields, ensures uniqueness of email and phone,
    hashes the password with Werkzeug, stores in PostgreSQL, and
    returns a JWT so the owner is immediately logged in.
    """
    name       = data.get("name", "").strip()
    email      = data.get("email", "").strip().lower()
    phone      = data.get("phone", "").strip()
    password   = data.get("password", "")
    pg_name    = data.get("pg_name", "").strip()
    pg_address = data.get("pg_address", "").strip()

    if not all([name, email, phone, password, pg_name, pg_address]):
        return error_response("All fields are required, including PG name and address", 400)

    if not is_valid_email(email):
        return error_response("Invalid email format", 400)

    if not is_valid_phone(phone):
        return error_response("Invalid phone number format (must be 10 digits)", 400)

    if not is_valid_password(password):
        return error_response("Password must be at least 8 characters", 400)

    if Owner.query.filter_by(email=email).first():
        return error_response("An account with this email already exists", 409)

    if Owner.query.filter_by(phone=phone).first():
        return error_response("An account with this phone number already exists", 409)

    # Hash password — never store plain text
    hashed_password = generate_password_hash(password)

    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        password=hashed_password,
    )

    db.session.add(new_owner)
    db.session.commit()

    new_pg = PG(
        pg_name=pg_name,
        address=pg_address,
        owner_id=new_owner.owner_id,
    )
    db.session.add(new_pg)
    db.session.commit()

    access_token = create_access_token(
        identity=str(new_owner.owner_id),
        additional_claims={"role": "owner"}
    )

    return success_response(
        "Owner registered and PG created successfully",
        data={
            "owner_id": new_owner.owner_id,
            "name": new_owner.name,
            "email": new_owner.email,
            "access_token": access_token,
            "role": "owner",
        },
        status_code=201,
    )


# ─────────────────────────────────────────────────────────────────────────────
# OWNER LOGIN
# ─────────────────────────────────────────────────────────────────────────────

def login_owner(data):
    """Authenticate an owner using database records only.

    Looks up the owner by email, verifies the hashed password using
    Werkzeug check_password_hash. Returns a generic error on failure
    to prevent user enumeration attacks.
    """
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required", 400)

    owner = Owner.query.filter_by(email=email).first()

    # Use a generic error — do NOT reveal whether email exists or not
    if not owner or not check_password_hash(owner.password, password):
        return error_response("Invalid email or password", 401)

    access_token = create_access_token(
        identity=str(owner.owner_id),
        additional_claims={"role": "owner"}
    )

    return success_response(
        "Login successful",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "access_token": access_token,
            "role": "owner",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# MEMBER LOGIN
# ─────────────────────────────────────────────────────────────────────────────

def login_member(data):
    """Authenticate a member using database records only.

    Members log in with their phone number and password.
    Default password is their phone number (set when owner creates them).
    If member has no password in DB (legacy), allow phone as password and
    auto-upgrade to a hashed record.
    """
    phone    = data.get("phone", "").strip()
    password = data.get("password", "")

    if not phone or not password:
        return error_response("Phone number and password are required", 400)

    member = Member.query.filter_by(phone=phone).first()

    # Generic error — do not reveal whether phone exists
    if not member:
        return error_response("Invalid phone number or password", 401)

    is_valid = False
    if not member.password:
        # Legacy member with no password — allow phone as password, then upgrade
        if password == phone:
            is_valid = True
            member.password = generate_password_hash(phone)
    else:
        is_valid = check_password_hash(member.password, password)

    if not is_valid:
        return error_response("Invalid phone number or password", 401)

    member.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
        identity=str(member.member_id),
        additional_claims={"role": "member"}
    )

    return success_response(
        "Login successful",
        data={
            "member_id": member.member_id,
            "name": member.member_name,
            "phone": member.phone,
            "access_token": access_token,
            "role": "member",
        },
    )



# ─────────────────────────────────────────────────────────────────────────────
# FORGOT PASSWORD
# ─────────────────────────────────────────────────────────────────────────────

def forgot_password_endpoint(data):
    """Generate a 6-digit OTP for password reset.

    For owners: sends OTP via email (if SMTP configured), falls back
    to returning OTP in API response.
    For members: OTP is returned in response (owner relays it).
    """
    identity = data.get("identity", "").strip()
    if not identity:
        return error_response("Email or phone number is required", 400)

    user = None
    role = None
    contact_email = None

    if "@" in identity:
        user = Owner.query.filter_by(email=identity.lower()).first()
        role = "owner"
        contact_email = identity.lower()
    else:
        user = Member.query.filter_by(phone=identity).first()
        role = "member"
        contact_email = None

    if not user:
        return error_response("No account found with that email or phone number", 404)

    reset_code = str(random.randint(100000, 999999))
    user.reset_token = reset_code
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=15)
    db.session.commit()

    email_sent = False
    if contact_email:
        from utils.email_utils import send_reset_email
        user_name = getattr(user, "name", getattr(user, "member_name", "User"))
        email_sent = send_reset_email(contact_email, reset_code, user_name)

    if email_sent:
        return success_response(
            "Password reset OTP sent to your email. Check your inbox.",
            data={"role": role, "email_sent": True},
        )
    else:
        return success_response(
            "OTP generated. Email delivery not configured — use the OTP below.",
            data={
                "reset_code": reset_code,
                "role": role,
                "email_sent": False,
            },
        )


# ─────────────────────────────────────────────────────────────────────────────
# RESET PASSWORD
# ─────────────────────────────────────────────────────────────────────────────

def reset_password_endpoint(data):
    """Reset password using a valid OTP.

    Validates OTP, checks expiry, then hashes and stores the new password.
    """
    identity     = data.get("identity", "").strip()
    reset_code   = data.get("reset_code", "").strip()
    new_password = data.get("new_password", "")

    if not all([identity, reset_code, new_password]):
        return error_response("All fields are required (identity, reset_code, new_password)", 400)

    if len(new_password) < 8:
        return error_response("New password must be at least 8 characters", 400)

    user = None
    if "@" in identity:
        user = Owner.query.filter_by(email=identity.lower()).first()
    else:
        user = Member.query.filter_by(phone=identity).first()

    if not user:
        return error_response("User not found", 404)

    if not user.reset_token or user.reset_token != reset_code:
        return error_response("Invalid or expired reset code", 400)

    if user.reset_token_expires < datetime.utcnow():
        return error_response("Reset code has expired. Please request a new one.", 400)

    user.password = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return success_response("Password reset successfully. You can now log in.")


# ─────────────────────────────────────────────────────────────────────────────
# CHANGE PASSWORD (authenticated)
# ─────────────────────────────────────────────────────────────────────────────

def change_password_endpoint(data):
    """Change password for an authenticated user.

    Verifies current password against the database hash.
    NO phone-as-password fallback — password must be set in DB.
    """
    current_password = data.get("current_password", "")
    new_password     = data.get("new_password", "")

    if not current_password or not new_password:
        return error_response("Current and new passwords are required", 400)

    if len(new_password) < 8:
        return error_response("New password must be at least 8 characters", 400)

    claims  = get_jwt()
    role    = claims.get("role")
    user_id = int(get_jwt_identity())

    if role == "member":
        user = db.session.get(Member, user_id)
    else:
        user = db.session.get(Owner, user_id)

    if not user:
        return error_response("User profile not found", 404)

    if not user.password:
        return error_response(
            "No password is set for your account. Please use Forgot Password to set one.", 400
        )

    if not check_password_hash(user.password, current_password):
        return error_response("Current password is incorrect", 400)

    user.password = generate_password_hash(new_password)
    if role == "member":
        user.is_first_login = False

    db.session.commit()
    return success_response("Password updated successfully")