from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.auth_service import (
    login_owner,
    register_owner,
    login_member,
    forgot_password_endpoint,
    reset_password_endpoint,
    change_password_endpoint,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    return register_owner(data)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    return login_owner(data)


@auth_bp.route("/member/login", methods=["POST"])
def member_login():
    data = request.get_json(silent=True) or {}
    return login_member(data)


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    return forgot_password_endpoint(data)


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    return reset_password_endpoint(data)


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    data = request.get_json(silent=True) or {}
    return change_password_endpoint(data)