from flask import Flask
from flask_cors import CORS

from config.database import db, Config

app = Flask(__name__)

app.config.from_object(Config)

CORS(app)

db.init_app(app)


@app.route("/")
def home():
    return {
        "message": "SmartPG Backend Running Successfully"
    }




if __name__ == "__main__":
    app.run(debug=True)