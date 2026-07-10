"""Routes for meal price management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.meal_price_service import (
    create_meal_price,
    get_meal_price,
    update_meal_price,
)

meal_price_bp = Blueprint("meal_price", __name__)


@meal_price_bp.route("/", methods=["POST"])
@jwt_required()
def add_meal_price():
    data = request.get_json(silent=True) or {}
    return create_meal_price(data)


@meal_price_bp.route("/", methods=["GET"])
@jwt_required()
def list_meal_price():
    return get_meal_price()


@meal_price_bp.route("/", methods=["PUT"])
@jwt_required()
def edit_meal_price():
    data = request.get_json(silent=True) or {}
    return update_meal_price(data)
