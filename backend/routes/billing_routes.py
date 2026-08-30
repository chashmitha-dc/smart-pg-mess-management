"""Routes for billing generation and retrieval."""

from flask import Blueprint, request
# pyrefly: ignore [missing-import]
from flask_jwt_extended import jwt_required
from utils.response import error_response
from services.manual_absence_service import create_manual_absence_adjustment

from services.billing_service import (
    generate_all_bills,
    generate_member_bill,
    get_bill,
    get_bills,
    resend_bill_email,
)

billing_bp = Blueprint("billing", __name__)


@billing_bp.route("/generate/<int:member_id>", methods=["POST"])
@jwt_required()
def create_member_bill(member_id):
    return generate_member_bill(member_id)


@billing_bp.route("/generate-all", methods=["POST"])
@jwt_required()
def create_all_member_bills():
    return generate_all_bills()


@billing_bp.route("/", methods=["GET"])
@jwt_required()
def list_bills():
    return get_bills()


@billing_bp.route("/<int:bill_id>", methods=["GET"])
@jwt_required()
def view_bill(bill_id):
    return get_bill(bill_id)


@billing_bp.route("/resend-email/<int:bill_id>", methods=["POST"])
@jwt_required()
def resend_bill_email_route(bill_id):
    return resend_bill_email(bill_id)

@billing_bp.route("/manual-absence", methods=["POST"])
@jwt_required()
def add_manual_absence():
    """Owner adds a manual absence deduction."""
    data = request.get_json() or {}
    member_id = data.get("member_id")
    absent_days = data.get("absent_days")
    reason = data.get("reason")
    if member_id is None or absent_days is None:
        return error_response("member_id and absent_days are required", 400)
    return create_manual_absence_adjustment(member_id, absent_days, reason)
