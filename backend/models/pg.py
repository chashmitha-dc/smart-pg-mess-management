from config.database import db


class PG(db.Model):
    """SQLAlchemy model for the pg table."""

    __tablename__ = "pg"

    pg_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("owner.owner_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    pg_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=True)
    upi_id = db.Column(db.String(100), nullable=True)
    absence_threshold = db.Column(db.Integer, nullable=False, default=7)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    owner = db.relationship("Owner", back_populates="pg")
    meal_prices = db.relationship(
        "MealPrice",
        back_populates="pg",
        cascade="all, delete-orphan",
    )
    meal_plans = db.relationship(
        "MealPlan",
        back_populates="pg",
        cascade="all, delete-orphan",
    )
    members = db.relationship(
        "Member",
        back_populates="pg",
        cascade="all, delete-orphan",
    )
    food_predictions = db.relationship(
        "FoodPrediction",
        back_populates="pg",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<PG pg_id={self.pg_id} pg_name={self.pg_name}>"
