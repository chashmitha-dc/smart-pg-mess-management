"""Database configuration for Flask application."""

import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()


def _build_db_url():
    """
    Use DATABASE_URL if set (Render/Neon), otherwise build from individual vars (local dev).
    Neon requires sslmode=require — appended automatically if missing.
    """
    url = os.getenv("DATABASE_URL")
    if url:
        # SQLAlchemy needs postgresql:// not postgres://
        url = url.replace("postgres://", "postgresql://", 1)
        # Neon requires SSL — add if not already in the URL
        if "sslmode" not in url:
            connector = "&" if "?" in url else "?"
            url = f"{url}{connector}sslmode=require"
        return url

    # Local development: build from individual vars
    return (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}"
        f"/{os.getenv('DB_NAME')}"
    )


class Config:
    SQLALCHEMY_DATABASE_URI = _build_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,       # Test connections before use (handles Neon idle disconnect)
        "pool_recycle": 300,          # Recycle connections every 5 min
        "pool_size": 2,               # Small pool for free tier
        "max_overflow": 3,
    }