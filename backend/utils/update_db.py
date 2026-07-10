import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.database import db

def update():
    with app.app_context():
        # Execute ALTER statements for columns
        try:
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS password VARCHAR(255);"))
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS profile_image TEXT;"))
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;"))
            db.session.execute(db.text("ALTER TABLE owner ADD COLUMN IF NOT EXISTS profile_photo TEXT;"))
            db.session.execute(db.text("ALTER TABLE member ALTER COLUMN emergency_contact DROP NOT NULL;"))
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;"))
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);"))
            db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;"))
            db.session.execute(db.text("ALTER TABLE owner ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);"))
            db.session.execute(db.text("ALTER TABLE owner ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;"))
            db.session.commit()
            print("Successfully updated existing tables with new columns.")
        except Exception as e:
            db.session.rollback()
            print(f"Error altering tables: {e}")

        # Create all new tables
        try:
            db.create_all()
            print("Successfully created any missing tables (like menu).")
        except Exception as e:
            print(f"Error creating tables: {e}")

if __name__ == "__main__":
    update()
