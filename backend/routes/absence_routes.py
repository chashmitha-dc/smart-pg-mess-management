"""Routes for absence (leave) management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.absence_service import (
    approve_absence_request,
    create_absence_request,
    get_absence_request,
    get_absence_requests,
    reject_absence_request,
)

absence_bp = Blueprint("absence", __name__)


@absence_bp.route("/", methods=["POST"])
@jwt_required()
def apply_leave():
    data = request.get_json(silent=True) or {}
    return create_absence_request(data)


@absence_bp.route("/", methods=["GET"])
@jwt_required()
def list_absence_requests():
    return get_absence_requests()


@absence_bp.route("/<int:absence_id>", methods=["GET"])
@jwt_required()
def view_absence_request(absence_id):
    return get_absence_request(absence_id)


@absence_bp.route("/<int:absence_id>/approve", methods=["PUT"])
@jwt_required()
def approve_leave(absence_id):
    return approve_absence_request(absence_id)


@absence_bp.route("/<int:absence_id>/reject", methods=["PUT"])
@jwt_required()
def reject_leave(absence_id):
    return reject_absence_request(absence_id)
