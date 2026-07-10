from flask import Blueprint, request
# pyrefly: ignore [missing-import]
from flask_jwt_extended import jwt_required
from services.menu_service import set_menu, get_menu_by_date, get_menu_range

menu_bp = Blueprint("menu", __name__)

@menu_bp.route("/", methods=["POST"])
@jwt_required()
def add_or_update_menu():
    data = request.get_json(silent=True) or {}
    return set_menu(data)

@menu_bp.route("/", methods=["GET"])
@jwt_required()
def get_menu():
    date_str = request.args.get("date")
    return get_menu_by_date(date_str)

@menu_bp.route("/range", methods=["GET"])
@jwt_required()
def get_menus_by_range():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return {"message": "start_date and end_date are required"}, 400
        
    return get_menu_range(start_date, end_date)
