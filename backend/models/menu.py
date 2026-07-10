from config.database import db

class Menu(db.Model):
    """SQLAlchemy model for the menu table."""

    __tablename__ = "menu"

    menu_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pg_id = db.Column(
        db.Integer,
        db.ForeignKey("pg.pg_id", ondelete="CASCADE"),
        nullable=False,
    )
    menu_date = db.Column(db.Date, nullable=False)
    breakfast = db.Column(db.Text, nullable=True)
    lunch = db.Column(db.Text, nullable=True)
    dinner = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.UniqueConstraint("pg_id", "menu_date", name="uq_pg_menu_date"),
    )

    # Relationships
    pg = db.relationship("PG")

    def __repr__(self):
        return f"<Menu menu_id={self.menu_id} menu_date={self.menu_date}>"
