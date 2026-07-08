from config.database import db


class MemberExit(db.Model):
    """SQLAlchemy model for the member_exit table."""

    __tablename__ = "member_exit"

    exit_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    leaving_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=True)
    refund = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    remarks = db.Column(db.Text, nullable=True)
    processed_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    member = db.relationship("Member", back_populates="member_exit")

    def __repr__(self):
        return f"<MemberExit exit_id={self.exit_id} member_id={self.member_id}>"
