from config.database import db


class Notification(db.Model):
    __tablename__ = "notification"

    notification_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), nullable=False)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    member = db.relationship("Member", back_populates="notifications")

    def __repr__(self):
        return f"<Notification notification_id={self.notification_id} title={self.title}>"
