from flask_jwt_extended import get_jwt_identity

from config.database import db
from models.pg import PG

from utils.response import success_response, error_response


def create_pg(data):

    owner_id = int(get_jwt_identity())

    existing_pg = PG.query.filter_by(owner_id=owner_id).first()

    if existing_pg:
        return error_response(
            "PG already exists for this owner",
            409,
        )

    pg_name = data.get("pg_name")
    address = data.get("address")
    upi_id = data.get("upi_id")
    absence_threshold = data.get("absence_threshold", 7)

    if not pg_name:
        return error_response(
            "PG name is required",
            400,
        )

    new_pg = PG(
        owner_id=owner_id,
        pg_name=pg_name,
        address=address,
        upi_id=upi_id,
        absence_threshold=absence_threshold,
    )

    db.session.add(new_pg)
    db.session.commit()

    return success_response(
        "PG created successfully",
        data={
            "pg_id": new_pg.pg_id,
            "pg_name": new_pg.pg_name,
        },
        status_code=201,
    )


def get_pg():

    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return error_response(
            "PG not found",
            404,
        )

    return success_response(
        "PG fetched successfully",
        data={
            "pg_id": pg.pg_id,
            "pg_name": pg.pg_name,
            "address": pg.address,
            "upi_id": pg.upi_id,
            "absence_threshold": pg.absence_threshold,
            "created_at": pg.created_at.isoformat(),
        },
    )


def update_pg(data):

    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return error_response(
            "PG not found",
            404,
        )

    if "pg_name" in data:
        pg.pg_name = data["pg_name"]

    if "address" in data:
        pg.address = data["address"]

    if "upi_id" in data:
        pg.upi_id = data["upi_id"]

    if "absence_threshold" in data:
        pg.absence_threshold = data["absence_threshold"]

    db.session.commit()

    return success_response(
        "PG updated successfully",
        data={
            "pg_id": pg.pg_id,
            "pg_name": pg.pg_name,
            "address": pg.address,
            "upi_id": pg.upi_id,
            "absence_threshold": pg.absence_threshold,
        },
    )