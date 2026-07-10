from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from services.backup_service import db_backup, db_restore

backup_bp = Blueprint("backup", __name__)

@backup_bp.route("/download", methods=["GET"])
@jwt_required()
def download_backup():
    return db_backup()

@backup_bp.route("/restore", methods=["POST"])
@jwt_required()
def restore_backup():
    if "file" not in request.files:
        return {"message": "No file uploaded"}, 400
    file = request.files["file"]
    return db_restore(file)
