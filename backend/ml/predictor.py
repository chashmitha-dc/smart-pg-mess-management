"""
Prediction module for SmartPG AI.
Loads the trained ML model lazily (on first prediction call) to save startup RAM.
"""

import os
import joblib
import pandas as pd


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "smartpg_model.pkl",
)


class SmartPGPredictor:
    """
    Loads the trained SmartPG model lazily and performs meal prediction.
    The model is only loaded when predict() is first called.
    """

    def __init__(self):
        self._model = None

    def _load_model(self):
        """Load the model from disk on first use."""
        if self._model is None:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(
                    "Model not found. Run train_model.py first."
                )
            self._model = joblib.load(MODEL_PATH)

    def predict(
        self,
        active_members,
        breakfast_plan_count,
        lunch_plan_count,
        dinner_plan_count,
        approved_leave_count,
    ):
        """Predict breakfast, lunch and dinner counts."""
        self._load_model()

        features = pd.DataFrame([{
            "active_members": active_members,
            "breakfast_plan_count": breakfast_plan_count,
            "lunch_plan_count": lunch_plan_count,
            "dinner_plan_count": dinner_plan_count,
            "approved_leave_count": approved_leave_count,
        }])

        prediction = self._model.predict(features)[0]

        return {
            "breakfast_prediction": max(0, int(round(prediction[0]))),
            "lunch_prediction": max(0, int(round(prediction[1]))),
            "dinner_prediction": max(0, int(round(prediction[2]))),
        }


# Lazy singleton — not instantiated at import time
_predictor = None


def _get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = SmartPGPredictor()
    return _predictor


def predict_meals(
    active_members,
    breakfast_plan_count,
    lunch_plan_count,
    dinner_plan_count,
    approved_leave_count,
):
    """Wrapper function used by Flask services."""
    return _get_predictor().predict(
        active_members,
        breakfast_plan_count,
        lunch_plan_count,
        dinner_plan_count,
        approved_leave_count,
    )


if __name__ == "__main__":
    result = predict_meals(
        active_members=120,
        breakfast_plan_count=110,
        lunch_plan_count=115,
        dinner_plan_count=108,
        approved_leave_count=6,
    )
    print("\nPrediction Result\n")
    print(result)