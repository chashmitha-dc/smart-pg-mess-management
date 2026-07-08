from config.database import db


class MealPrice(db.Model):
    __tablename__ = "meal_price"

    price_id = db.Column(db.Integer, primary_key=True)
    pg_id = db.Column(
        db.Integer,
        db.ForeignKey("pg.pg_id", ondelete="CASCADE"),
        nullable=False,
    )
    breakfast_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    lunch_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    dinner_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    effective_from = db.Column(db.Date, nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)

    pg = db.relationship("Pg", back_populates="meal_prices")

    def __repr__(self):
        return f"<MealPrice price_id={self.price_id} pg_id={self.pg_id}>"
