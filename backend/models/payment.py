from config.database import db


class Payment(db.Model):
    """SQLAlchemy model for the payment table."""

    __tablename__ = "payment"

    payment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bill_id = db.Column(
        db.Integer,
        db.ForeignKey("bill.bill_id", ondelete="CASCADE"),
        nullable=False,
    )
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(30), nullable=False)
    payment_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    transaction_id = db.Column(db.String(100), nullable=True)
    payment_proof = db.Column(db.String(255), nullable=True)
    verification_status = db.Column(db.String(20), nullable=False, default="pending")
    remarks = db.Column(db.Text, nullable=True)

    bill = db.relationship("Bill", back_populates="payments")

    def __repr__(self):
        return f"<Payment payment_id={self.payment_id} amount={self.amount}>"
