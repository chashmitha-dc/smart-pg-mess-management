"""Placeholder module for owner-related services."""

# TODO: Implement owner service logic here.
from flask_jwt_extended import get_jwt_identity

from models.owner import Owner

from utils.response import success_response, error_response


def get_owner_profile():

    owner_id = get_jwt_identity()

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
        },
    )