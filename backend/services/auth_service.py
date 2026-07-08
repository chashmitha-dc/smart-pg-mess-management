"""Placeholder module for authentication business logic."""

# Authentication business logic will be implemented here.
# This file is intentionally left as a placeholder.
from werkzeug.security import generate_password_hash

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

    owner = Owner.query.filter_by(email=email).first()

    if owner:
        return error_response(
            "Email already registered",
            409,
        )

    owner = Owner.query.filter_by(phone=phone).first()

    if owner:
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