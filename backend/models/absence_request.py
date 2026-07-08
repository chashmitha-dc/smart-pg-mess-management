from config.database import db


class AbsenceRequest(db.Model):
    __tablename__ = "absence_request"

    absence_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    from_date = db.Column(db.Date, nullable=False)
    to_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    requested_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    member = db.relationship("Member", back_populates="absence_requests")

    def __repr__(self):
        return f"<AbsenceRequest absence_id={self.absence_id} status={self.status}>"
