from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash
from config.database import db
from models.owner import Owner
from utils.response import success_response, error_response

def get_owner_profile():
    owner_id = int(get_jwt_identity())
    owner = Owner.query.get(owner_id)

    if not owner:
        return error_response("Owner not found", 404)

    return success_response(
        "Owner profile fetched successfully",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "phone": owner.phone,
            "profile_photo": owner.profile_photo,
        },
    )

def update_owner_profile(data):
    owner_id = int(get_jwt_identity())
    owner = Owner.query.get(owner_id)

    if not owner:
        return error_response("Owner not found", 404)

    if "name" in data:
        owner.name = data["name"]
    if "email" in data:
        owner.email = data["email"]
    if "phone" in data:
        owner.phone = data["phone"]
    if "profile_photo" in data:
        owner.profile_photo = data["profile_photo"]
    if "password" in data and data["password"]:
        owner.password = generate_password_hash(data["password"])

    db.session.commit()

    return success_response(
        "Owner profile updated successfully",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "phone": owner.phone,
            "profile_photo": owner.profile_photo,
        },
    )