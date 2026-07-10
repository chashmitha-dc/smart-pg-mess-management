"""
Prediction module for SmartPG AI.
Loads the trained ML model and predicts meal requirements.
"""

import os
import joblib
import numpy as np


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "smartpg_model.pkl",
)


class SmartPGPredictor:
    """
    Loads the trained SmartPG model
    and performs meal prediction.
    """

    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Run train_model.py first."
            )

        self.model = joblib.load(MODEL_PATH)

    def predict(
        self,
        active_members,
        breakfast_plan_count,
        lunch_plan_count,
        dinner_plan_count,
        approved_leave_count,
    ):
        """
        Predict breakfast, lunch and dinner counts.
        """

        features = np.array(
            [[
                active_members,
                breakfast_plan_count,
                lunch_plan_count,
                dinner_plan_count,
                approved_leave_count,
            ]]
        )

        prediction = self.model.predict(features)[0]

        return {
            "breakfast_prediction": max(
                0,
                int(round(prediction[0]))
            ),
            "lunch_prediction": max(
                0,
                int(round(prediction[1]))
            ),
            "dinner_prediction": max(
                0,
                int(round(prediction[2]))
            ),
        }


predictor = SmartPGPredictor()


def predict_meals(
    active_members,
    breakfast_plan_count,
    lunch_plan_count,
    dinner_plan_count,
    approved_leave_count,
):
    """
    Wrapper function used by Flask services.
    """

    return predictor.predict(
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