"""
Train the SmartPG AI Food Prediction Model.
"""

import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    r2_score,
)


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    CURRENT_DIR,
    "dataset.csv",
)

MODEL_PATH = os.path.join(
    CURRENT_DIR,
    "smartpg_model.pkl",
)


def load_dataset():
    """
    Load the generated dataset.
    """

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            "dataset.csv not found. Run dataset_generator.py first."
        )

    dataframe = pd.read_csv(DATASET_PATH)

    return dataframe


def prepare_data(dataframe):
    """
    Split dataset into features and targets.
    """

    X = dataframe[
        [
            "active_members",
            "breakfast_plan_count",
            "lunch_plan_count",
            "dinner_plan_count",
            "approved_leave_count",
        ]
    ]

    y = dataframe[
        [
            "breakfast_actual",
            "lunch_actual",
            "dinner_actual",
        ]
    ]

    return train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )


def train_model(X_train, y_train):
    """
    Train the Random Forest model.
    """

    model = MultiOutputRegressor(
        RandomForestRegressor(
            n_estimators=150,
            random_state=42,
        )
    )

    model.fit(
        X_train,
        y_train,
    )

    return model


def evaluate_model(model, X_test, y_test):
    """
    Evaluate the trained model.
    """

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    r2 = r2_score(
        y_test,
        predictions,
    )

    print("=" * 60)
    print("SmartPG AI Model Evaluation")
    print("=" * 60)
    print(f"Mean Absolute Error : {mae:.2f}")
    print(f"R² Score            : {r2:.4f}")
    print("=" * 60)


def save_model(model):
    """
    Save trained model.
    """

    joblib.dump(
        model,
        MODEL_PATH,
    )

    print(f"\nModel saved successfully:\n{MODEL_PATH}")


def main():

    print("\nLoading dataset...")

    dataframe = load_dataset()

    X_train, X_test, y_train, y_test = prepare_data(
        dataframe
    )

    print("Training Random Forest Model...")

    model = train_model(
        X_train,
        y_train,
    )

    evaluate_model(
        model,
        X_test,
        y_test,
    )

    save_model(
        model,
    )


if __name__ == "__main__":
    main()