"""Service layer for member management."""

from datetime import date, timedelta

from flask_jwt_extended import get_jwt_identity

from werkzeug.security import generate_password_hash
from config.database import db
from models.meal_plan import MealPlan
from models.member import Member
from models.pg import PG
from utils.response import error_response, success_response


def _get_owner_pg():
    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()
    if not pg:
        return None, error_response("PG not found", 404)
    return pg, None


def _validate_plan(pg, current_plan_id):
    if not current_plan_id:
        return error_response("Current plan is required", 400)

    meal_plan = MealPlan.query.filter_by(pg_id=pg.pg_id, plan_id=current_plan_id).first()
    if not meal_plan:
        return error_response("Selected meal plan not found", 404)

    return None


def create_member(data):
    pg, error = _get_owner_pg()
    if error:
        return error

    member_name = data.get("member_name")
    phone = data.get("phone")
    emergency_contact = data.get("emergency_contact")
    current_plan_id = data.get("current_plan_id")

    if not member_name:
        return error_response("Member name is required", 400)

    if not phone:
        return error_response("Phone is required", 400)

    if len(phone) != 10 or not phone.isdigit():
        return error_response("Phone number must be exactly 10 digits", 400)

    plan_error = _validate_plan(pg, current_plan_id)
    if plan_error:
        return plan_error

    existing_member = Member.query.filter_by(pg_id=pg.pg_id, phone=phone).first()
    if existing_member:
        return error_response("Phone already exists for this PG", 409)

    joining_date = data.get("joining_date")
    if not joining_date:
        joining_date = date.today()
    else:
        joining_date = date.fromisoformat(joining_date)

    billing_start_date = data.get("billing_start_date") or joining_date
    if isinstance(billing_start_date, str):
        billing_start_date = date.fromisoformat(billing_start_date)

    next_billing_date = billing_start_date + timedelta(days=30)

    # Default password = phone number (hashed). Owner can set a custom password.
    # Member logs in with phone as username and phone as password by default.
    custom_password = data.get("password", "").strip()
    if custom_password:
        hashed_pwd = generate_password_hash(custom_password)
    else:
        hashed_pwd = generate_password_hash(phone)


    new_member = Member(
        pg_id=pg.pg_id,
        current_plan_id=current_plan_id,
        member_name=member_name,
        phone=phone,
        emergency_contact=emergency_contact,
        joining_date=joining_date,
        billing_start_date=billing_start_date,
        next_billing_date=next_billing_date,
        status=data.get("status", "active"),
        password=hashed_pwd,
    )

    db.session.add(new_member)
    db.session.commit()

    return success_response(
        "Member created successfully",
        data={
            "member_id": new_member.member_id,
            "member_name": new_member.member_name,
            "phone": new_member.phone,
            "current_plan_id": new_member.current_plan_id,
            "status": new_member.status,
        },
        status_code=201,
    )


def get_members():
    pg, error = _get_owner_pg()
    if error:
        if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
            return success_response("Members fetched successfully", data=[])
        return error

    members = Member.query.filter_by(pg_id=pg.pg_id).all()

    member_data = [
        {
            "member_id": member.member_id,
            "member_name": member.member_name,
            "phone": member.phone,
            "emergency_contact": member.emergency_contact,
            "current_plan_id": member.current_plan_id,
            "status": member.status,
            "joining_date": member.joining_date.isoformat(),
            "billing_start_date": member.billing_start_date.isoformat(),
            "next_billing_date": member.next_billing_date.isoformat(),
        }
        for member in members
    ]

    return success_response("Members fetched successfully", data=member_data)


def get_member(member_id):
    pg, error = _get_owner_pg()
    if error:
        return error

    member = Member.query.filter_by(pg_id=pg.pg_id, member_id=member_id).first()

    if not member:
        return error_response("Member not found", 404)

    return success_response(
        "Member fetched successfully",
        data={
            "member_id": member.member_id,
            "member_name": member.member_name,
            "phone": member.phone,
            "emergency_contact": member.emergency_contact,
            "current_plan_id": member.current_plan_id,
            "status": member.status,
            "joining_date": member.joining_date.isoformat(),
            "billing_start_date": member.billing_start_date.isoformat(),
            "next_billing_date": member.next_billing_date.isoformat(),
        },
    )


def update_member(member_id, data):
    pg, error = _get_owner_pg()
    if error:
        return error

    member = Member.query.filter_by(pg_id=pg.pg_id, member_id=member_id).first()

    if not member:
        return error_response("Member not found", 404)

    if "member_name" in data and not data["member_name"]:
        return error_response("Member name is required", 400)

    if "phone" in data:
        phone = data["phone"]
        if not phone:
            return error_response("Phone is required", 400)
        if len(phone) != 10 or not phone.isdigit():
            return error_response("Phone number must be exactly 10 digits", 400)

    if "current_plan_id" in data:
        plan_error = _validate_plan(pg, data["current_plan_id"])
        if plan_error:
            return plan_error
        member.current_plan_id = data["current_plan_id"]

    if "phone" in data:
        existing_member = Member.query.filter_by(pg_id=pg.pg_id, phone=data["phone"]).first()
        if existing_member and existing_member.member_id != member_id:
            return error_response("Phone already exists for this PG", 409)
        member.phone = data["phone"]

    if "member_name" in data:
        member.member_name = data["member_name"]

    if "emergency_contact" in data:
        member.emergency_contact = data["emergency_contact"]

    if "status" in data:
        member.status = data["status"]

    if "joining_date" in data and data["joining_date"]:
        member.joining_date = date.fromisoformat(data["joining_date"])

    if "billing_start_date" in data and data["billing_start_date"]:
        member.billing_start_date = date.fromisoformat(data["billing_start_date"])
        member.next_billing_date = member.billing_start_date + timedelta(days=30)

    db.session.commit()

    return success_response(
        "Member updated successfully",
        data={
            "member_id": member.member_id,
            "member_name": member.member_name,
            "phone": member.phone,
            "emergency_contact": member.emergency_contact,
            "current_plan_id": member.current_plan_id,
            "status": member.status,
        },
    )


def delete_member(member_id):
    pg, error = _get_owner_pg()
    if error:
        return error

    member = Member.query.filter_by(pg_id=pg.pg_id, member_id=member_id).first()

    if not member:
        return error_response("Member not found", 404)

    db.session.delete(member)
    db.session.commit()

    return success_response("Member deleted successfully")


def get_member_profile():
    member_id = int(get_jwt_identity())
    member = Member.query.get(member_id)
    if not member:
        return error_response("Member not found", 404)

    return success_response(
        "Member profile fetched successfully",
        data={
            "member_id": member.member_id,
            "member_name": member.member_name,
            "phone": member.phone,
            "emergency_contact": member.emergency_contact,
            "current_plan_id": member.current_plan_id,
            "status": member.status,
            "joining_date": member.joining_date.isoformat(),
            "billing_start_date": member.billing_start_date.isoformat(),
            "next_billing_date": member.next_billing_date.isoformat(),
            "profile_image": member.profile_image,
            "last_login": member.last_login.isoformat() if member.last_login else None,
            "plan_name": member.current_plan.plan_name if member.current_plan else "No Plan"
        }
    )


def update_member_profile(data):
    member_id = int(get_jwt_identity())
    member = Member.query.get(member_id)
    if not member:
        return error_response("Member not found", 404)

    if "password" in data and data["password"]:
        member.password = generate_password_hash(data["password"])

    if "profile_image" in data:
        member.profile_image = data["profile_image"]

    db.session.commit()

    return success_response(
        "Profile updated successfully",
        data={
            "member_id": member.member_id,
            "member_name": member.member_name,
            "phone": member.phone,
            "profile_image": member.profile_image
        }
    )
