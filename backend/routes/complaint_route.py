"""Routes for complaint management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.complaint_service import (
    create_complaint,
    get_complaints,
    get_complaint,
    update_complaint,
    delete_complaint,
)

complaint_bp = Blueprint("complaint", __name__)


@complaint_bp.route("/", methods=["POST"])
@jwt_required()
def add_complaint():
    """Create a new complaint."""
    data = request.get_json(silent=True) or {}
    return create_complaint(data)


@complaint_bp.route("/", methods=["GET"])
@jwt_required()
def list_complaints():
    """Return all complaints."""
    return get_complaints()


@complaint_bp.route("/<int:complaint_id>", methods=["GET"])
@jwt_required()
def view_complaint(complaint_id):
    """Return one complaint."""
    return get_complaint(complaint_id)


@complaint_bp.route("/<int:complaint_id>", methods=["PUT"])
@jwt_required()
def edit_complaint(complaint_id):
    """Update complaint."""
    data = request.get_json(silent=True) or {}
    return update_complaint(complaint_id, data)


@complaint_bp.route("/<int:complaint_id>", methods=["DELETE"])
@jwt_required()
def remove_complaint(complaint_id):
    """Delete complaint."""
    return delete_complaint(complaint_id)