"""Service layer for SmartPG AI."""

from datetime import date, timedelta
import os
import subprocess
import sys

from flask_jwt_extended import get_jwt_identity

from config.database import db

from models.pg import PG
from models.member import Member
from models.meal_plan import MealPlan
from models.absence_request import AbsenceRequest
from models.food_prediction import FoodPrediction

from ml.predictor import predict_meals
from ml.recommendation import generate_recommendation

from utils.response import (
    success_response,
    error_response,
)


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)


def _get_owner_pg():
    """
    Return logged-in owner's PG.
    """

    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(
        owner_id=owner_id
    ).first()

    if not pg:
        return None, error_response(
            "PG not found",
            404,
        )

    return pg, None


def _collect_prediction_data(pg):
    """
    Collect all features automatically from database.
    """

    active_members = Member.query.filter_by(
        pg_id=pg.pg_id,
        status="active",
    ).all()

    member_count = len(active_members)

    breakfast_count = 0
    lunch_count = 0
    dinner_count = 0

    tomorrow = date.today() + timedelta(days=1)

    approved_leave_count = 0

    for member in active_members:

        plan = MealPlan.query.filter_by(
            plan_id=member.current_plan_id
        ).first()

        if plan:

            if plan.breakfast:
                breakfast_count += 1

            if plan.lunch:
                lunch_count += 1

            if plan.dinner:
                dinner_count += 1

        leave = AbsenceRequest.query.filter(
            AbsenceRequest.member_id == member.member_id,
            AbsenceRequest.status == "approved",
            AbsenceRequest.from_date <= tomorrow,
            AbsenceRequest.to_date >= tomorrow,
        ).first()

        if leave:
            approved_leave_count += 1

    return {
        "active_members": member_count,
        "breakfast_plan_count": breakfast_count,
        "lunch_plan_count": lunch_count,
        "dinner_plan_count": dinner_count,
        "approved_leave_count": approved_leave_count,
    }


def train_ai_model():
    """
    Generate dataset and train model.
    """

    try:

        subprocess.run(
            [sys.executable, "ml/dataset_generator.py"],
            cwd=BACKEND_DIR,
            check=True,
        )

        subprocess.run(
            [sys.executable, "ml/train_model.py"],
            cwd=BACKEND_DIR,
            check=True,
        )

        return success_response(
            "AI model trained successfully"
        )

    except Exception as e:

        return error_response(
            str(e),
            500,
        )
def predict_food():
    """
    Predict tomorrow's meal requirement automatically.
    """

    pg, error = _get_owner_pg()

    if error:
        return error

    tomorrow = date.today() + timedelta(days=1)

    existing_prediction = FoodPrediction.query.filter_by(
        pg_id=pg.pg_id,
        prediction_date=tomorrow,
    ).first()

    if existing_prediction:

        prediction = {
            "breakfast_prediction": existing_prediction.expected_breakfast,
            "lunch_prediction": existing_prediction.expected_lunch,
            "dinner_prediction": existing_prediction.expected_dinner,
        }

        recommendations = generate_recommendation(
            prediction
        )

        return success_response(
            "Prediction already exists",
            data={
                "prediction": prediction,
                "recommendations": recommendations,
            },
        )

    features = _collect_prediction_data(pg)

    prediction = predict_meals(
        active_members=features["active_members"],
        breakfast_plan_count=features["breakfast_plan_count"],
        lunch_plan_count=features["lunch_plan_count"],
        dinner_plan_count=features["dinner_plan_count"],
        approved_leave_count=features["approved_leave_count"],
    )

    prediction_record = FoodPrediction(
        pg_id=pg.pg_id,
        prediction_date=tomorrow,
        expected_breakfast=prediction["breakfast_prediction"],
        expected_lunch=prediction["lunch_prediction"],
        expected_dinner=prediction["dinner_prediction"],
        actual_breakfast=0,
        actual_lunch=0,
        actual_dinner=0,
        accuracy=None,
    )

    db.session.add(prediction_record)
    db.session.commit()

    recommendations = generate_recommendation(
        prediction
    )

    return success_response(
        "Prediction generated successfully",
        data={
            "prediction_date": tomorrow.isoformat(),
            "features": features,
            "prediction": prediction,
            "recommendations": recommendations,
        },
    )


def prediction_history():
    """
    Return all predictions for the owner's PG.
    """

    pg, error = _get_owner_pg()

    if error:
        return error

    predictions = (
        FoodPrediction.query.filter_by(
            pg_id=pg.pg_id,
        )
        .order_by(
            FoodPrediction.prediction_date.desc()
        )
        .all()
    )

    history = []

    for prediction in predictions:

        history.append(
            {
                "prediction_id": prediction.prediction_id,
                "prediction_date": prediction.prediction_date.isoformat(),
                "expected_breakfast": prediction.expected_breakfast,
                "expected_lunch": prediction.expected_lunch,
                "expected_dinner": prediction.expected_dinner,
                "actual_breakfast": prediction.actual_breakfast,
                "actual_lunch": prediction.actual_lunch,
                "actual_dinner": prediction.actual_dinner,
                "accuracy": (
                    float(prediction.accuracy)
                    if prediction.accuracy is not None
                    else None
                ),
            }
        )

    return success_response(
        "Prediction history fetched successfully",
        data=history,
    )