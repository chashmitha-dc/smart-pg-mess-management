from config.database import db


class Owner(db.Model):
    """SQLAlchemy model for the owner table."""

    __tablename__ = "owner"

    owner_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    pg = db.relationship(
        "PG",
        back_populates="owner",
        uselist=False,
        cascade="all, delete",
    )

    def __repr__(self):
        return f"<Owner owner_id={self.owner_id} email={self.email}>"

