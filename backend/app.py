import os
from datetime import timedelta
from routes.pg_routes import pg_bp
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.database import db, Config
import models
from routes.auth_routes import auth_bp
from routes.owner_routes import owner_bp
from routes.meal_plan_routes import meal_plan_bp
from routes.member_routes import member_bp
from routes.absence_routes import absence_bp
from routes.meal_price_routes import meal_price_bp
from routes.billing_routes import billing_bp
from routes.payment_routes import payment_bp
from routes.complaint_route import complaint_bp
from routes.ai_routes import ai_bp
from routes.dashboard_routes import dashboard_bp
from routes.menu_routes import menu_bp
from routes.backup_routes import backup_bp
from routes.notification_routes import notification_bp
from utils.email_utils import init_mail

app = Flask(__name__)
app.url_map.strict_slashes = False

# Load database configuration
app.config.from_object(Config)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "smartpg-dev-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# Resend Email Configuration (set env var RESEND_API_KEY for Resend HTTPS API)
app.config["RESEND_API_KEY"] = os.getenv("RESEND_API_KEY", "")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", "SmartPG <onboarding@resend.dev>")

# Initialize extensions
allowed_origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://smart-pg-mess-management-bay.vercel.app",
    "https://smartpg-frontend.vercel.app",
    "https://www.smartpgmess.site",
    "https://smartpgmess.site",
    os.getenv("FRONTEND_URL", "").rstrip("/"),
}
allowed_origins = {origin for origin in allowed_origins if origin}

CORS(
    app,
    resources={r"/api/*": {"origins": list(allowed_origins)}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
db.init_app(app)
jwt = JWTManager(app)
init_mail(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(owner_bp, url_prefix="/api/owner")
app.register_blueprint(pg_bp, url_prefix="/api/pg")
app.register_blueprint(meal_plan_bp, url_prefix="/api/meal-plan")
app.register_blueprint(member_bp, url_prefix="/api/member")
app.register_blueprint(absence_bp, url_prefix="/api/absence")
app.register_blueprint(meal_price_bp, url_prefix="/api/meal-price")
app.register_blueprint(billing_bp, url_prefix="/api/billing")
app.register_blueprint(payment_bp, url_prefix="/api/payment")
app.register_blueprint(complaint_bp, url_prefix="/api/complaint")
app.register_blueprint(ai_bp,url_prefix="/api/ai")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(menu_bp, url_prefix="/api/menu")
app.register_blueprint(backup_bp, url_prefix="/api/backup")
app.register_blueprint(notification_bp, url_prefix="/api/notification")

@app.route("/")
def home():
    return {
        "message": "SmartPG Backend Running Successfully"
    }


# Auto-create all tables on startup (safe — skips existing tables)
with app.app_context():
    db.create_all()
    try:
        db.session.execute(db.text("ALTER TABLE member ADD COLUMN IF NOT EXISTS billing_increment NUMERIC(10, 2) DEFAULT 0.00;"))
        db.session.commit()
    except Exception as e:
        db.session.rollback()


# Triggering reload for env variables
if __name__ == "__main__":
    app.run(debug=True)