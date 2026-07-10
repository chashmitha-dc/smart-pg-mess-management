"""Service layer for absence (leave) management."""

from datetime import date

from flask_jwt_extended import get_jwt_identity, get_jwt

from config.database import db
from models.absence_request import AbsenceRequest
from models.member import Member
from models.pg import PG
from utils.response import success_response, error_response
from utils.email_utils import send_leave_request_email


def _get_owner_pg():
    """Return the PG for the logged-in owner."""
    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return None, error_response("PG not found", 404)

    return pg, None


def _parse_date(value):
    """Convert YYYY-MM-DD string into a date object."""

    if isinstance(value, date):
        return value

    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _has_overlap(member_id, from_date, to_date):
    """Check overlapping leave requests."""

    overlap = (
        AbsenceRequest.query.filter(
            AbsenceRequest.member_id == member_id,
            AbsenceRequest.status.in_(["pending", "approved"]),
            AbsenceRequest.from_date <= to_date,
            AbsenceRequest.to_date >= from_date,
        )
        .first()
    )

    return overlap is not None


def create_absence_request(data):
    """Create a leave request."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    from_date = _parse_date(data.get("from_date"))
    to_date = _parse_date(data.get("to_date"))
    reason = data.get("reason")

    if not from_date:
        return error_response("From date is required", 400)

    if not to_date:
        return error_response("To date is required", 400)

    if from_date > to_date:
        return error_response(
            "From date cannot be after To date",
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
            return error_response("Member ID is required", 400)
        member = Member.query.filter_by(
            pg_id=pg.pg_id,
            member_id=member_id,
        ).first()

    if not member:
        return error_response(
            "Member not found",
            404,
        )

    if member.status != "active":
        return error_response(
            "Only active members can apply for leave",
            400,
        )

    if _has_overlap(member.member_id, from_date, to_date):
        return error_response(
            "Overlapping leave request already exists",
            409,
        )

    leave = AbsenceRequest(
        member_id=member.member_id,
        from_date=from_date,
        to_date=to_date,
        reason=reason,
        status="pending",
    )

    db.session.add(leave)
    db.session.commit()

    # --- Email owner about new leave request ---
    try:
        pg = PG.query.filter_by(pg_id=member.pg_id).first()
        if pg and pg.owner:
            days = (to_date - from_date).days + 1
            send_leave_request_email(
                owner_email=pg.owner.email,
                owner_name=pg.owner.name,
                member_name=member.member_name,
                member_room=getattr(member, 'room_number', None),
                from_date=from_date.strftime("%d %b %Y"),
                to_date=to_date.strftime("%d %b %Y"),
                days=days,
                reason=reason,
                pg_name=pg.pg_name,
            )
    except Exception as email_err:
        print(f"[EMAIL WARNING] Could not notify owner: {email_err}")
    # ------------------------------------------

    return success_response(
        "Leave request created successfully",
        data={
            "absence_id": leave.absence_id,
            "member_id": leave.member_id,
            "member_name": member.member_name,
            "from_date": leave.from_date.isoformat(),
            "to_date": leave.to_date.isoformat(),
            "reason": leave.reason,
            "status": leave.status,
        },
        status_code=201,
    )


def get_absence_requests():
    """Return all leave requests."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        requests = (
            AbsenceRequest.query.filter_by(member_id=member_id)
            .order_by(AbsenceRequest.requested_at.desc())
            .all()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
                return success_response("Absence requests fetched successfully", data=[])
            return error
        requests = (
            AbsenceRequest.query.join(Member)
            .filter(Member.pg_id == pg.pg_id)
            .order_by(AbsenceRequest.requested_at.desc())
            .all()
        )

    data = []

    for request in requests:
        data.append(
            {
                "absence_id": request.absence_id,
                "member_id": request.member_id,
                "member_name": request.member.member_name,
                "from_date": request.from_date.isoformat(),
                "to_date": request.to_date.isoformat(),
                "reason": request.reason,
                "status": request.status,
                "requested_at": request.requested_at.isoformat(),
            }
        )

    return success_response(
        "Leave requests fetched successfully",
        data=data,
    )


def get_absence_request(absence_id):
    """Return one leave request."""

    pg, error = _get_owner_pg()

    if error:
        return error

    request = (
        AbsenceRequest.query.join(Member)
        .filter(
            AbsenceRequest.absence_id == absence_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not request:
        return error_response(
            "Leave request not found",
            404,
        )

    return success_response(
        "Leave request fetched successfully",
        data={
            "absence_id": request.absence_id,
            "member_id": request.member_id,
            "from_date": request.from_date.isoformat(),
            "to_date": request.to_date.isoformat(),
            "reason": request.reason,
            "status": request.status,
            "requested_at": request.requested_at.isoformat(),
        },
    )


def approve_absence_request(absence_id):
    """Approve a pending leave request."""

    pg, error = _get_owner_pg()

    if error:
        return error

    request = (
        AbsenceRequest.query.join(Member)
        .filter(
            AbsenceRequest.absence_id == absence_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not request:
        return error_response(
            "Leave request not found",
            404,
        )

    if request.status != "pending":
        return error_response(
            "Only pending leave requests can be approved",
            409,
        )

    request.status = "approved"

    db.session.commit()

    return success_response(
        "Leave request approved successfully",
        data={
            "absence_id": request.absence_id,
            "status": request.status,
        },
    )


def reject_absence_request(absence_id):
    """Reject a pending leave request."""

    pg, error = _get_owner_pg()

    if error:
        return error

    request = (
        AbsenceRequest.query.join(Member)
        .filter(
            AbsenceRequest.absence_id == absence_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not request:
        return error_response(
            "Leave request not found",
            404,
        )

    if request.status != "pending":
        return error_response(
            "Only pending leave requests can be rejected",
            409,
        )

    request.status = "rejected"

    db.session.commit()

    return success_response(
        "Leave request rejected successfully",
        data={
            "absence_id": request.absence_id,
            "status": request.status,
        },
    )