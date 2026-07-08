from config.database import db


class MealPlan(db.Model):
    """SQLAlchemy model for the meal_plan table."""

    __tablename__ = "meal_plan"

    plan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pg_id = db.Column(
        db.Integer,
        db.ForeignKey("pg.pg_id", ondelete="CASCADE"),
        nullable=False,
    )
    plan_name = db.Column(db.String(100), nullable=False)
    breakfast = db.Column(db.Boolean, nullable=False, default=False)
    lunch = db.Column(db.Boolean, nullable=False, default=False)
    dinner = db.Column(db.Boolean, nullable=False, default=False)
    active = db.Column(db.Boolean, nullable=False, default=True)

    pg = db.relationship("PG", back_populates="meal_plans")
    members = db.relationship(
        "Member",
        back_populates="current_plan",
        foreign_keys="Member.current_plan_id",
        cascade="all, delete-orphan",
    )
    member_plan_histories = db.relationship(
        "MemberPlanHistory",
        back_populates="meal_plan",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<MealPlan plan_id={self.plan_id} plan_name={self.plan_name}>"
