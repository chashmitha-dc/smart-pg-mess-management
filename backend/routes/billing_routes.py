"""Routes for billing generation and retrieval."""

from flask import Blueprint
# pyrefly: ignore [missing-import]
from flask_jwt_extended import jwt_required

from services.billing_service import (
    generate_all_bills,
    generate_member_bill,
    get_bill,
    get_bills,
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
