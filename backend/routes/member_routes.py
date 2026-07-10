"""Routes for member management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.member_service import (
    create_member,
    delete_member,
    get_member,
    get_members,
    update_member,
    get_member_profile,
    update_member_profile,
)

member_bp = Blueprint("member", __name__)


@member_bp.route("/", methods=["POST"])
@jwt_required()
def add_member():
    data = request.get_json()
    return create_member(data)


@member_bp.route("/", methods=["GET"])
@jwt_required()
def list_members():
    return get_members()


@member_bp.route("/<int:member_id>", methods=["GET"])
@jwt_required()
def view_member(member_id):
    return get_member(member_id)


@member_bp.route("/<int:member_id>", methods=["PUT"])
@jwt_required()
def edit_member(member_id):
    data = request.get_json()
    return update_member(member_id, data)


@member_bp.route("/<int:member_id>", methods=["DELETE"])
@jwt_required()
def remove_member(member_id):
    return delete_member(member_id)


@member_bp.route("/profile", methods=["GET"])
@jwt_required()
def member_profile():
    return get_member_profile()


@member_bp.route("/profile", methods=["PUT"])
@jwt_required()
def edit_member_profile():
    data = request.get_json(silent=True) or {}
    return update_member_profile(data)
