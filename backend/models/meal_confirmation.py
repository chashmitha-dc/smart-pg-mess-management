from config.database import db


class MealConfirmation(db.Model):
    """SQLAlchemy model for the meal_confirmation table."""

    __tablename__ = "meal_confirmation"

    confirmation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    date = db.Column(db.Date, nullable=False)
    breakfast = db.Column(db.Boolean, nullable=False, default=False)
    lunch = db.Column(db.Boolean, nullable=False, default=False)
    dinner = db.Column(db.Boolean, nullable=False, default=False)
    confirmed_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    member = db.relationship("Member", back_populates="meal_confirmations")

    def __repr__(self):
        return f"<MealConfirmation confirmation_id={self.confirmation_id} date={self.date}>"
