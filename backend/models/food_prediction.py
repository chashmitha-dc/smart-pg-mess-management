from config.database import db


class FoodPrediction(db.Model):
    """SQLAlchemy model for the food_prediction table."""

    __tablename__ = "food_prediction"

    prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pg_id = db.Column(
        db.Integer,
        db.ForeignKey("pg.pg_id", ondelete="CASCADE"),
        nullable=False,
    )
    prediction_date = db.Column(db.Date, nullable=False)
    expected_breakfast = db.Column(db.Integer, nullable=False, default=0)
    expected_lunch = db.Column(db.Integer, nullable=False, default=0)
    expected_dinner = db.Column(db.Integer, nullable=False, default=0)
    actual_breakfast = db.Column(db.Integer, nullable=False, default=0)
    actual_lunch = db.Column(db.Integer, nullable=False, default=0)
    actual_dinner = db.Column(db.Integer, nullable=False, default=0)
    accuracy = db.Column(db.Numeric(5, 2), nullable=True)

    pg = db.relationship("PG", back_populates="food_predictions")

    def __repr__(self):
        return f"<FoodPrediction prediction_id={self.prediction_id} date={self.prediction_date}>"
