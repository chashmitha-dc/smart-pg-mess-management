"""Routes for payment management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.payment_service import (
    create_payment,
    delete_payment,
    get_payment,
    get_payments,
    update_payment,
)

payment_bp = Blueprint("payment", __name__)


@payment_bp.route("/", methods=["POST"])
@jwt_required()
def add_payment():
    data = request.get_json(silent=True) or {}
    return create_payment(data)


@payment_bp.route("/", methods=["GET"])
@jwt_required()
def list_payments():
    return get_payments()


@payment_bp.route("/<int:payment_id>", methods=["GET"])
@jwt_required()
def view_payment(payment_id):
    return get_payment(payment_id)


@payment_bp.route("/<int:payment_id>", methods=["PUT"])
@jwt_required()
def edit_payment(payment_id):
    data = request.get_json(silent=True) or {}
    return update_payment(payment_id, data)


@payment_bp.route("/<int:payment_id>", methods=["DELETE"])
@jwt_required()
def remove_payment(payment_id):
    return delete_payment(payment_id)