"""Service layer for complaint management."""

from datetime import datetime

from flask_jwt_extended import get_jwt_identity, get_jwt

from config.database import db
from models.complaint import Complaint
from models.member import Member
from models.pg import PG
from utils.response import success_response, error_response


VALID_STATUS = {
    "open",
    "in_progress",
    "resolved",
    "closed",
}

VALID_CATEGORIES = {
    "Food",
    "Food / Mess",
    "Electricity",
    "Water",
    "WiFi",
    "WiFi / Internet",
    "Cleaning",
    "Cleaning / Hygiene",
    "Room",
    "Room Issue",
    "Maintenance",
    "Other",
}


def _get_owner_pg():
    """Return the PG belonging to the logged-in owner."""

    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(
        owner_id=owner_id
    ).first()

    if not pg:
        return None, error_response(
            "PG not found",
            404,
        )

    return pg, None


def _build_complaint_payload(complaint):
    """Convert Complaint object into JSON."""

    return {
        "complaint_id": complaint.complaint_id,
        "member_id": complaint.member_id,
        "member_name": complaint.member.member_name if complaint.member else "Unknown",
        "category": complaint.category,
        "description": complaint.description,
        "status": complaint.status,
        "created_at": complaint.created_at.isoformat(),
        "resolved_at": (
            complaint.resolved_at.isoformat()
            if complaint.resolved_at
            else None
        ),
    }


def create_complaint(data):
    """Create a new complaint."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    category = data.get("category")
    description = data.get("description")

    if not category:
        return error_response(
            "Category is required",
            400,
        )

    if category not in VALID_CATEGORIES:
        return error_response(
            "Invalid complaint category",
            400,
        )

    if not description:
        return error_response(
            "Description is required",
            400,
        )

    if role == "member":
        member_id = int(get_jwt_identity())
        member = db.session.get(Member, member_id)
    else:
        pg, error = _get_owner_pg()
        if error:
            return error
        member_id = data.get("member_id")
        if not member_id:
            return error_response(
                "Member ID is required",
                400,
            )
        member = Member.query.filter_by(
            member_id=member_id,
            pg_id=pg.pg_id,
        ).first()

    if not member:
        return error_response(
            "Member not found",
            404,
        )

    complaint = Complaint(
        member_id=member.member_id,
        category=category,
        description=description,
        status="open",
    )

    db.session.add(complaint)
    db.session.commit()

    return success_response(
        "Complaint created successfully",
        data=_build_complaint_payload(
            complaint
        ),
        status_code=201,
    )


def get_complaints():
    """Return all complaints."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        complaints = (
            Complaint.query
            .filter_by(member_id=member_id)
            .order_by(Complaint.created_at.desc())
            .all()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
                return success_response("Complaints fetched successfully", data=[])
            return error
        complaints = (
            Complaint.query
            .join(Member)
            .filter(
                Member.pg_id == pg.pg_id
            )
            .order_by(
                Complaint.created_at.desc()
            )
            .all()
        )

    complaint_data = [
        _build_complaint_payload(
            complaint
        )
        for complaint in complaints
    ]

    return success_response(
        "Complaints fetched successfully",
        data=complaint_data,
    )
def get_complaint(complaint_id):
    """Return one complaint."""

    pg, error = _get_owner_pg()

    if error:
        return error

    complaint = (
        Complaint.query
        .join(Member)
        .filter(
            Complaint.complaint_id == complaint_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not complaint:
        return error_response(
            "Complaint not found",
            404,
        )

    return success_response(
        "Complaint fetched successfully",
        data=_build_complaint_payload(
            complaint
        ),
    )


def update_complaint(complaint_id, data):
    """Update complaint status and details."""

    pg, error = _get_owner_pg()

    if error:
        return error

    complaint = (
        Complaint.query
        .join(Member)
        .filter(
            Complaint.complaint_id == complaint_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not complaint:
        return error_response(
            "Complaint not found",
            404,
        )

    if "category" in data:

        if data["category"] not in VALID_CATEGORIES:
            return error_response(
                "Invalid complaint category",
                400,
            )

        complaint.category = data["category"]

    if "description" in data:

        if not data["description"]:
            return error_response(
                "Description is required",
                400,
            )

        complaint.description = data["description"]

    if "status" in data:

        if data["status"] not in VALID_STATUS:
            return error_response(
                "Invalid complaint status",
                400,
            )

        complaint.status = data["status"]

        if complaint.status in ["resolved", "closed"]:
            complaint.resolved_at = datetime.utcnow()
        else:
            complaint.resolved_at = None

    db.session.commit()

    return success_response(
        "Complaint updated successfully",
        data=_build_complaint_payload(
            complaint
        ),
    )


def delete_complaint(complaint_id):
    """Delete a complaint."""

    pg, error = _get_owner_pg()

    if error:
        return error

    complaint = (
        Complaint.query
        .join(Member)
        .filter(
            Complaint.complaint_id == complaint_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not complaint:
        return error_response(
            "Complaint not found",
            404,
        )

    db.session.delete(complaint)
    db.session.commit()

    return success_response(
        "Complaint deleted successfully",
    )