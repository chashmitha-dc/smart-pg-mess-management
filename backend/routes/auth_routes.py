"""Authentication routes for owner registration and login."""

from flask import Blueprint, request

from services.auth_service import login_owner, register_owner

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    return register_owner(data)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    return login_owner(data)