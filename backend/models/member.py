from datetime import date

from config.database import db


class Member(db.Model):
    """SQLAlchemy model for the member table."""

    __tablename__ = "member"

    member_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pg_id = db.Column(
        db.Integer,
        db.ForeignKey("pg.pg_id", ondelete="CASCADE"),
        nullable=False,
    )
    current_plan_id = db.Column(
        db.Integer,
        db.ForeignKey("meal_plan.plan_id", ondelete="RESTRICT"),
        nullable=False,
    )
    member_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=False)
    emergency_contact = db.Column(db.String(20), nullable=True)
    joining_date = db.Column(db.Date, nullable=False, default=date.today)
    billing_start_date = db.Column(db.Date, nullable=False, default=date.today)
    next_billing_date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(20), nullable=False, default="active")
    password = db.Column(db.String(255), nullable=True)
    profile_image = db.Column(db.Text, nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    is_first_login = db.Column(db.Boolean, default=True, nullable=False)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    pg = db.relationship("PG", back_populates="members")
    current_plan = db.relationship(
        "MealPlan",
        back_populates="members",
        foreign_keys=[current_plan_id],
    )
    plan_histories = db.relationship(
        "MemberPlanHistory",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    absence_requests = db.relationship(
        "AbsenceRequest",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    meal_confirmations = db.relationship(
        "MealConfirmation",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    bills = db.relationship(
        "Bill",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    complaints = db.relationship(
        "Complaint",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    notifications = db.relationship(
        "Notification",
        back_populates="member",
        cascade="all, delete-orphan",
    )
    member_exit = db.relationship(
        "MemberExit",
        back_populates="member",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Member member_id={self.member_id} member_name={self.member_name}>"
