from datetime import datetime
from config.database import db

class ManualAbsenceAdjustment(db.Model):
    """Model to record owner‑created manual absence deductions.
    Linked to a specific Bill (which represents a billing period) and Member.
    """

    __tablename__ = "manual_absence_adjustments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("owner.owner_id"), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey("member.member_id"), nullable=False)
    bill_id = db.Column(db.Integer, db.ForeignKey("bill.bill_id"), nullable=True)
    billing_period_start = db.Column(db.Date, nullable=False)
    billing_period_end = db.Column(db.Date, nullable=False)
    absent_days = db.Column(db.Integer, nullable=False)
    daily_rate = db.Column(db.Numeric(10, 2), nullable=False)
    deduction_amount = db.Column(db.Numeric(10, 2), nullable=False)
    reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default="applied")

    __table_args__ = (
        db.UniqueConstraint('member_id', 'billing_period_start', 'absent_days', name='uq_manual_absence_member_period_days'),
    )

    # Relationships (optional, for convenient access)
    member = db.relationship('Member', backref='manual_absence_adjustments')
    owner = db.relationship('Owner', backref='manual_absence_adjustments')
    bill = db.relationship('Bill', backref='manual_absence_adjustments')

    def __repr__(self):
        return f"<ManualAbsenceAdjustment id={self.id} member_id={self.member_id} bill_id={self.bill_id}>"
