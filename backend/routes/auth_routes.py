"""Placeholder module for authentication routes."""

# Authentication routes will be implemented here.
# This file is intentionally left as a placeholder.
from flask import Blueprint, request

from services.auth_service import register_owner

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    return register_owner(data)