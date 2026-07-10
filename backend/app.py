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

# Flask-Mail Configuration (set env vars MAIL_USERNAME and MAIL_PASSWORD for Gmail)
app.config["MAIL_SERVER"]   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"]     = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"]  = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
app.config["MAIL_USE_SSL"]  = os.getenv("MAIL_USE_SSL", "false").lower() == "true"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME", "")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME", "noreply@smartpg.com")

# Initialize extensions
CORS(app)
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


# Triggering reload for env variables
if __name__ == "__main__":
    app.run(debug=True)