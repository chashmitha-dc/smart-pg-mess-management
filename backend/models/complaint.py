from config.database import db


class Complaint(db.Model):
    __tablename__ = "complaint"

    complaint_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="open")
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())
    resolved_at = db.Column(db.TIMESTAMP, nullable=True)

    member = db.relationship("Member", back_populates="complaints")

    def __repr__(self):
        return f"<Complaint complaint_id={self.complaint_id} status={self.status}>"
