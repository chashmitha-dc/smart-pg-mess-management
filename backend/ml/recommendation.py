"""
Recommendation engine for SmartPG AI.
Generates suggestions based on predicted meal counts.
"""


def generate_recommendation(prediction):
    """
    Generate recommendations using the prediction.
    """

    recommendations = []

    breakfast = prediction["breakfast_prediction"]
    lunch = prediction["lunch_prediction"]
    dinner = prediction["dinner_prediction"]

    # Breakfast
    recommendations.append(
        f"Prepare approximately {breakfast} breakfasts."
    )

    if breakfast < 30:
        recommendations.append(
            "Breakfast demand is low."
        )
    elif breakfast < 80:
        recommendations.append(
            "Breakfast demand is moderate."
        )
    else:
        recommendations.append(
            "Breakfast demand is high."
        )

    # Lunch
    recommendations.append(
        f"Prepare approximately {lunch} lunches."
    )

    if lunch < 30:
        recommendations.append(
            "Lunch demand is low."
        )
    elif lunch < 80:
        recommendations.append(
            "Lunch demand is moderate."
        )
    else:
        recommendations.append(
            "Lunch demand is high."
        )

    # Dinner
    recommendations.append(
        f"Prepare approximately {dinner} dinners."
    )

    if dinner < 30:
        recommendations.append(
            "Dinner demand is low."
        )
    elif dinner < 80:
        recommendations.append(
            "Dinner demand is moderate."
        )
    else:
        recommendations.append(
            "Dinner demand is high."
        )

    highest = max(breakfast, lunch, dinner)

    if highest == breakfast:
        recommendations.append(
            "Breakfast is expected to have the highest demand."
        )

    elif highest == lunch:
        recommendations.append(
            "Lunch is expected to have the highest demand."
        )

    else:
        recommendations.append(
            "Dinner is expected to have the highest demand."
        )

    return recommendations


if __name__ == "__main__":

    sample_prediction = {
        "breakfast_prediction": 82,
        "lunch_prediction": 95,
        "dinner_prediction": 88,
    }

    print("\nAI Recommendations\n")

    for recommendation in generate_recommendation(sample_prediction):
        print("-", recommendation)