"""Routes for meal plan management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.meal_plan_service import (
    create_meal_plan,
    delete_meal_plan,
    get_meal_plan,
    get_meal_plans,
    update_meal_plan,
)

meal_plan_bp = Blueprint("meal_plan", __name__)


@meal_plan_bp.route("/", methods=["POST"])
@jwt_required()
def add_meal_plan():
    data = request.get_json()
    return create_meal_plan(data)


@meal_plan_bp.route("/", methods=["GET"])
@jwt_required()
def list_meal_plans():
    return get_meal_plans()


@meal_plan_bp.route("/<int:plan_id>", methods=["GET"])
@jwt_required()
def view_meal_plan(plan_id):
    return get_meal_plan(plan_id)


@meal_plan_bp.route("/<int:plan_id>", methods=["PUT"])
@jwt_required()
def edit_meal_plan(plan_id):
    data = request.get_json()
    return update_meal_plan(plan_id, data)


@meal_plan_bp.route("/<int:plan_id>", methods=["DELETE"])
@jwt_required()
def remove_meal_plan(plan_id):
    return delete_meal_plan(plan_id)
