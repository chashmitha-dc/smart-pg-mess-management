"""Service layer for meal plan management."""

from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func

from config.database import db
from models.meal_plan import MealPlan
from models.pg import PG
from utils.response import error_response, success_response


def _get_owner_pg():
    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()
    if not pg:
        return None, error_response("PG not found", 404)
    return pg, None


def create_meal_plan(data):
    pg, error = _get_owner_pg()
    if error:
        return error

    plan_name = data.get("plan_name")
    breakfast = data.get("breakfast", False)
    lunch = data.get("lunch", False)
    dinner = data.get("dinner", False)

    if not plan_name:
        return error_response("Plan name is required", 400)

    existing_plan = MealPlan.query.filter_by(pg_id=pg.pg_id).filter(func.lower(MealPlan.plan_name) == func.lower(plan_name)).first()
    if existing_plan:
        return error_response("Meal plan already exists for this PG", 400)

    if not any([breakfast, lunch, dinner]):
        return error_response("At least one meal option must be selected", 400)

    new_plan = MealPlan(
        pg_id=pg.pg_id,
        plan_name=plan_name,
        breakfast=breakfast,
        lunch=lunch,
        dinner=dinner,
        active=data.get("active", True),
    )

    db.session.add(new_plan)
    db.session.commit()

    return success_response(
        "Meal plan created successfully",
        data={
            "plan_id": new_plan.plan_id,
            "plan_name": new_plan.plan_name,
            "breakfast": new_plan.breakfast,
            "lunch": new_plan.lunch,
            "dinner": new_plan.dinner,
            "active": new_plan.active,
        },
        status_code=201,
    )


def get_meal_plans():
    pg, error = _get_owner_pg()
    if error:
        if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
            return success_response("Meal plans fetched successfully", data=[])
        return error

    plans = MealPlan.query.filter_by(pg_id=pg.pg_id).order_by(MealPlan.plan_id.asc()).all()

    plan_data = [
        {
            "plan_id": plan.plan_id,
            "plan_name": plan.plan_name,
            "breakfast": plan.breakfast,
            "lunch": plan.lunch,
            "dinner": plan.dinner,
            "active": plan.active,
        }
        for plan in plans
    ]

    return success_response("Meal plans fetched successfully", data=plan_data)


def get_meal_plan(plan_id):
    pg, error = _get_owner_pg()
    if error:
        return error

    plan = MealPlan.query.filter_by(pg_id=pg.pg_id, plan_id=plan_id).first()

    if not plan:
        return error_response("Meal plan not found", 404)

    return success_response(
        "Meal plan fetched successfully",
        data={
            "plan_id": plan.plan_id,
            "plan_name": plan.plan_name,
            "breakfast": plan.breakfast,
            "lunch": plan.lunch,
            "dinner": plan.dinner,
            "active": plan.active,
        },
    )


def update_meal_plan(plan_id, data):
    pg, error = _get_owner_pg()
    if error:
        return error

    plan = MealPlan.query.filter_by(pg_id=pg.pg_id, plan_id=plan_id).first()

    if not plan:
        return error_response("Meal plan not found", 404)

    if "plan_name" in data:
        if not data["plan_name"]:
            return error_response("Plan name is required", 400)

        existing_plan = MealPlan.query.filter_by(pg_id=pg.pg_id).filter(func.lower(MealPlan.plan_name) == func.lower(data["plan_name"])).first()
        if existing_plan and existing_plan.plan_id != plan_id:
            return error_response("Meal plan already exists for this PG", 400)

        plan.plan_name = data["plan_name"]

    if "breakfast" in data:
        plan.breakfast = data["breakfast"]

    if "lunch" in data:
        plan.lunch = data["lunch"]

    if "dinner" in data:
        plan.dinner = data["dinner"]

    if "active" in data:
        plan.active = data["active"]

    if not any([plan.breakfast, plan.lunch, plan.dinner]):
        return error_response("At least one meal option must be selected", 400)

    db.session.commit()

    return success_response(
        "Meal plan updated successfully",
        data={
            "plan_id": plan.plan_id,
            "plan_name": plan.plan_name,
            "breakfast": plan.breakfast,
            "lunch": plan.lunch,
            "dinner": plan.dinner,
            "active": plan.active,
        },
    )


def delete_meal_plan(plan_id):
    pg, error = _get_owner_pg()
    if error:
        return error

    plan = MealPlan.query.filter_by(pg_id=pg.pg_id, plan_id=plan_id).first()

    if not plan:
        return error_response("Meal plan not found", 404)

    from models.member import Member
    assigned_member = Member.query.filter_by(pg_id=pg.pg_id, current_plan_id=plan_id).first()
    if assigned_member:
        return error_response("This meal plan is currently assigned to members.", 400)

    db.session.delete(plan)
    db.session.commit()

    return success_response("Meal plan deleted successfully")
