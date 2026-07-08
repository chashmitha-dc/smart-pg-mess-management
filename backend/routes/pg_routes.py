from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.pg_service import create_pg, get_pg, update_pg

pg_bp = Blueprint("pg", __name__)


@pg_bp.route("/", methods=["POST"])
@jwt_required()
def add_pg():
    data = request.get_json()
    return create_pg(data)


@pg_bp.route("/", methods=["GET"])
@jwt_required()
def view_pg():
    return get_pg()


@pg_bp.route("/", methods=["PUT"])
@jwt_required()
def edit_pg():
    data = request.get_json()
    return update_pg(data)