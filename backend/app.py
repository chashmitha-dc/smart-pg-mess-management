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


app = Flask(__name__)

# Load database configuration
app.config.from_object(Config)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "smartpg-dev-secret"
)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# Initialize extensions
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(owner_bp, url_prefix="/api/owner")
app.register_blueprint(pg_bp, url_prefix="/api/pg")
app.register_blueprint(meal_plan_bp, url_prefix="/api/meal-plan")

@app.route("/")
def home():
    return {
        "message": "SmartPG Backend Running Successfully"
    }


if __name__ == "__main__":
    app.run(debug=True)