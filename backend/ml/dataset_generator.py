"""
Generate a realistic synthetic dataset for SmartPG AI Food Prediction.
"""

import random
import pandas as pd


TOTAL_RECORDS = 1000


def generate_record():
    """
    Generate one realistic training record.
    """

    active_members = random.randint(20, 250)

    breakfast_plan_count = random.randint(
        int(active_members * 0.65),
        active_members,
    )

    lunch_plan_count = random.randint(
        int(active_members * 0.75),
        active_members,
    )

    dinner_plan_count = random.randint(
        int(active_members * 0.70),
        active_members,
    )

    approved_leave_count = random.randint(
        0,
        int(active_members * 0.20),
    )

    breakfast_actual = (
        breakfast_plan_count
        - approved_leave_count
        - random.randint(0, 4)
    )

    lunch_actual = (
        lunch_plan_count
        - approved_leave_count
        - random.randint(0, 5)
    )

    dinner_actual = (
        dinner_plan_count
        - approved_leave_count
        - random.randint(0, 4)
    )

    breakfast_actual = max(0, breakfast_actual)
    lunch_actual = max(0, lunch_actual)
    dinner_actual = max(0, dinner_actual)

    return {
        "active_members": active_members,
        "breakfast_plan_count": breakfast_plan_count,
        "lunch_plan_count": lunch_plan_count,
        "dinner_plan_count": dinner_plan_count,
        "approved_leave_count": approved_leave_count,
        "breakfast_actual": breakfast_actual,
        "lunch_actual": lunch_actual,
        "dinner_actual": dinner_actual,
    }


def generate_dataset():
    """
    Generate the complete dataset.
    """

    dataset = []

    for _ in range(TOTAL_RECORDS):
        dataset.append(
            generate_record()
        )

    dataframe = pd.DataFrame(dataset)

    return dataframe
import os


def save_dataset(dataframe):
    """
    Save dataset as dataset.csv inside the ml folder.
    """

    current_directory = os.path.dirname(
        os.path.abspath(__file__)
    )

    output_path = os.path.join(
        current_directory,
        "dataset.csv",
    )

    dataframe.to_csv(
        output_path,
        index=False,
    )

    print("=" * 60)
    print("SmartPG AI Dataset Generated Successfully")
    print("=" * 60)
    print(f"Location : {output_path}")
    print(f"Total Records : {len(dataframe)}")
    print()

    print("First 5 Records")
    print(dataframe.head())

    print()
    print("Dataset Information")
    print(dataframe.describe())


def main():
    """
    Entry point.
    """

    dataframe = generate_dataset()

    save_dataset(dataframe)


if __name__ == "__main__":
    main()