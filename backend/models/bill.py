from config.database import db


class Bill(db.Model):
    __tablename__ = "bill"

    bill_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(
        db.Integer,
        db.ForeignKey("member.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    billing_period_start = db.Column(db.Date, nullable=False)
    billing_period_end = db.Column(db.Date, nullable=False)
    original_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    absence_deduction = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    manual_discount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    late_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    final_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    paid_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    balance_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    status = db.Column(db.String(20), nullable=False, default="pending")
    generated_at = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    member = db.relationship("Member", back_populates="bills")
    payments = db.relationship(
        "Payment",
        back_populates="bill",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Bill bill_id={self.bill_id} status={self.status}>"
