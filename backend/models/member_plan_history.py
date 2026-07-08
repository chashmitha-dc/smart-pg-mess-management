from config.database import db


class MemberPlanHistory(db.Model):
    """SQLAlchemy model for the member_plan_history table."""

    __tablename__ = "member_plan_history"

    history_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    plan_id = db.Column(
        db.Integer,
        db.ForeignKey("meal_plan.plan_id", ondelete="RESTRICT"),
        nullable=False,
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    active = db.Column(db.Boolean, nullable=False, default=True)

    member = db.relationship("Member", back_populates="plan_histories")
    meal_plan = db.relationship("MealPlan", back_populates="member_plan_histories")

    def __repr__(self):
        return f"<MemberPlanHistory history_id={self.history_id} member_id={self.member_id}>"
