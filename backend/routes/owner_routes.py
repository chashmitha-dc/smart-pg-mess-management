"""Placeholder module for owner-related routes."""

# TODO: Implement owner routes here.
from flask import Blueprint

from flask_jwt_extended import jwt_required
from flask import request

from services.owner_service import get_owner_profile, update_owner_profile

owner_bp = Blueprint("owner", __name__)


@owner_bp.route("/profile", methods=["GET"])
@jwt_required()
def owner_profile():
    return get_owner_profile()


@owner_bp.route("/profile", methods=["PUT"])
@jwt_required()
def edit_owner_profile():
    data = request.get_json(silent=True) or {}
    return update_owner_profile(data)