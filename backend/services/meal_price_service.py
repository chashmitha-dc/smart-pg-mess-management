"""Service layer for meal price management."""

from datetime import date

from flask_jwt_extended import get_jwt_identity

from config.database import db
from models.meal_price import MealPrice
from models.pg import PG
from utils.response import error_response, success_response


def _get_owner_pg():
    """Return the PG for the logged-in owner."""
    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return None, error_response("PG not found", 404)

    return pg, None


def _parse_date(value):
    """Convert a date string into a date object."""
    if isinstance(value, date):
        return value

    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def create_meal_price(data):
    """Create a new active meal price for the owner's PG."""
    pg, error = _get_owner_pg()
    if error:
        return error

    breakfast_price = data.get("breakfast_price")
    lunch_price = data.get("lunch_price")
    dinner_price = data.get("dinner_price")
    effective_from = _parse_date(data.get("effective_from"))

    if breakfast_price is None or lunch_price is None or dinner_price is None:
        return error_response("All price fields are required", 400)

    if breakfast_price < 0 or lunch_price < 0 or dinner_price < 0:
        return error_response("Prices must be greater than or equal to 0", 400)

    if not effective_from:
        return error_response("Effective from date is required", 400)

    existing_active = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()
    if existing_active:
        existing_active.active = False

    new_price = MealPrice(
        pg_id=pg.pg_id,
        breakfast_price=breakfast_price,
        lunch_price=lunch_price,
        dinner_price=dinner_price,
        effective_from=effective_from,
        active=True,
    )

    db.session.add(new_price)
    db.session.commit()

    return success_response(
        "Meal price created successfully",
        data={
            "price_id": new_price.price_id,
            "breakfast_price": float(new_price.breakfast_price),
            "lunch_price": float(new_price.lunch_price),
            "dinner_price": float(new_price.dinner_price),
            "effective_from": new_price.effective_from.isoformat(),
            "active": new_price.active,
        },
        status_code=201,
    )


def get_meal_price():
    """Return the currently active meal price for the owner's PG."""
    pg, error = _get_owner_pg()
    if error:
        return error

    meal_price = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()

    if not meal_price:
        return error_response("Meal price not found", 404)

    return success_response(
        "Meal price fetched successfully",
        data={
            "price_id": meal_price.price_id,
            "breakfast_price": float(meal_price.breakfast_price),
            "lunch_price": float(meal_price.lunch_price),
            "dinner_price": float(meal_price.dinner_price),
            "effective_from": meal_price.effective_from.isoformat(),
            "active": meal_price.active,
        },
    )


def update_meal_price(data):
    """Update the active meal price for the owner's PG."""
    pg, error = _get_owner_pg()
    if error:
        return error

    meal_price = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()

    if not meal_price:
        return error_response("Meal price not found", 404)

    if "breakfast_price" in data:
        if data["breakfast_price"] is None:
            return error_response("Breakfast price is required", 400)
        if data["breakfast_price"] < 0:
            return error_response("Breakfast price must be greater than or equal to 0", 400)
        meal_price.breakfast_price = data["breakfast_price"]

    if "lunch_price" in data:
        if data["lunch_price"] is None:
            return error_response("Lunch price is required", 400)
        if data["lunch_price"] < 0:
            return error_response("Lunch price must be greater than or equal to 0", 400)
        meal_price.lunch_price = data["lunch_price"]

    if "dinner_price" in data:
        if data["dinner_price"] is None:
            return error_response("Dinner price is required", 400)
        if data["dinner_price"] < 0:
            return error_response("Dinner price must be greater than or equal to 0", 400)
        meal_price.dinner_price = data["dinner_price"]

    if "effective_from" in data:
        effective_from = _parse_date(data.get("effective_from"))
        if not effective_from:
            return error_response("Effective from date is required", 400)
        meal_price.effective_from = effective_from

    db.session.commit()

    return success_response(
        "Meal price updated successfully",
        data={
            "price_id": meal_price.price_id,
            "breakfast_price": float(meal_price.breakfast_price),
            "lunch_price": float(meal_price.lunch_price),
            "dinner_price": float(meal_price.dinner_price),
            "effective_from": meal_price.effective_from.isoformat(),
            "active": meal_price.active,
        },
    )
