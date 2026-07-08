"""Authentication service layer for owner registration and login."""

from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from config.database import db
from models.owner import Owner

from utils.response import success_response, error_response
from utils.validators import (
    is_valid_email,
    is_valid_phone,
    is_valid_password,
)


def register_owner(data):

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([name, email, phone, password]):
        return error_response("All fields are required", 400)

    if not is_valid_email(email):
        return error_response("Invalid email", 400)

    if not is_valid_phone(phone):
        return error_response("Invalid phone number", 400)

    if not is_valid_password(password):
        return error_response(
            "Password must be at least 8 characters",
            400,
        )

    if Owner.query.filter_by(email=email).first():
        return error_response(
            "Email already registered",
            409,
        )

    if Owner.query.filter_by(phone=phone).first():
        return error_response(
            "Phone already registered",
            409,
        )

    hashed_password = generate_password_hash(password)

    new_owner = Owner(
        name=name,
        email=email,
        phone=phone,
        password=hashed_password,
    )

    db.session.add(new_owner)
    db.session.commit()

    return success_response(
        "Owner registered successfully",
        status_code=201,
    )


def login_owner(data):

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response(
            "Email and password are required",
            400,
        )

    owner = Owner.query.filter_by(email=email).first()

    if not owner:
        return error_response(
            "Email not found",
            404,
        )

    if not check_password_hash(owner.password, password):
        return error_response(
            "Invalid password",
            401,
        )

    access_token = create_access_token(
        identity=str(owner.owner_id)
    )

    return success_response(
        "Login successful",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "access_token": access_token,
        },
    )