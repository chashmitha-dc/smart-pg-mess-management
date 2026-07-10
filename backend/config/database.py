"""Database configuration placeholder for Flask application setup."""

# Placeholder module for production database configuration.
# Add environment-based connection settings here without changing the app structure.
import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

db = SQLAlchemy()

def _build_db_url():
    """Use DATABASE_URL if set (Render/Neon), otherwise build from individual vars (local dev)."""
    url = os.getenv("DATABASE_URL")
    if url:
        # Neon/Render sometimes gives postgres:// — SQLAlchemy needs postgresql://
        return url.replace("postgres://", "postgresql://", 1)
    return (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}"
        f"/{os.getenv('DB_NAME')}"
    )

class Config:
    SQLALCHEMY_DATABASE_URI = _build_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False