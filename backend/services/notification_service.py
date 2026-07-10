from flask_jwt_extended import get_jwt_identity, get_jwt

from config.database import db
from models.notification import Notification
from models.member import Member
from models.pg import PG
from utils.response import success_response, error_response


VALID_NOTIFICATION_TYPES = {
    "bill",
    "payment",
    "leave",
    "complaint",
    "general",
}


def _get_owner_pg():
    """Return the PG for the logged-in owner."""

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


def _build_notification_payload(notification):
    """Convert Notification object into JSON."""

    return {
        "notification_id": notification.notification_id,
        "member_id": notification.member_id,
        "member_name": notification.member.member_name if notification.member else "Unknown",
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }


def create_notification(data):
    """Create a notification."""

    pg, error = _get_owner_pg()

    if error:
        return error

    member_id = data.get("member_id")
    title = data.get("title")
    message = data.get("message")
    notification_type = data.get("type")

    if not member_id:
        return error_response(
            "Member ID is required",
            400,
        )

    if not title:
        return error_response(
            "Title is required",
            400,
        )

    if not message:
        return error_response(
            "Message is required",
            400,
        )

    if not notification_type:
        return error_response(
            "Notification type is required",
            400,
        )

    if notification_type not in VALID_NOTIFICATION_TYPES:
        return error_response(
            "Invalid notification type",
            400,
        )

    if member_id == "all":
        # Send to all active members
        active_members = Member.query.filter_by(pg_id=pg.pg_id, status="active").all()
        if not active_members:
            return error_response("No active members found in PG", 404)
        
        created_notifs = []
        for m in active_members:
            notification = Notification(
                member_id=m.member_id,
                title=title,
                message=message,
                type=notification_type,
                is_read=False,
            )
            db.session.add(notification)
            created_notifs.append(notification)
        db.session.commit()

        return success_response(
            "Notification sent to all active members successfully",
            data=[_build_notification_payload(n) for n in created_notifs],
            status_code=201,
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

    notification = Notification(
        member_id=member.member_id,
        title=title,
        message=message,
        type=notification_type,
        is_read=False,
    )

    db.session.add(notification)
    db.session.commit()

    return success_response(
        "Notification created successfully",
        data=_build_notification_payload(
            notification
        ),
        status_code=201,
    )


def get_notifications():
    """Return all notifications."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        notifications = (
            Notification.query
            .filter_by(member_id=member_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
                return success_response("Notifications fetched successfully", data=[])
            return error
        notifications = (
            Notification.query
            .join(Member)
            .filter(
                Member.pg_id == pg.pg_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

    notification_data = [
        _build_notification_payload(
            notification
        )
        for notification in notifications
    ]

    return success_response(
        "Notifications fetched successfully",
        data=notification_data,
    )


def get_notification(notification_id):
    """Return one notification."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        notification = (
            Notification.query
            .filter_by(notification_id=notification_id, member_id=member_id)
            .first()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            return error
        notification = (
            Notification.query
            .join(Member)
            .filter(
                Notification.notification_id == notification_id,
                Member.pg_id == pg.pg_id,
            )
            .first()
        )

    if not notification:
        return error_response(
            "Notification not found",
            404,
        )

    return success_response(
        "Notification fetched successfully",
        data=_build_notification_payload(
            notification
        ),
    )


def update_notification(notification_id, data):
    """Update notification. Members can mark is_read; owners can update all fields."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        # Member can only mark their own notification as read
        member_id = int(get_jwt_identity())
        notification = (
            Notification.query
            .filter_by(notification_id=notification_id, member_id=member_id)
            .first()
        )
        if not notification:
            return error_response("Notification not found", 404)
        if "is_read" in data:
            notification.is_read = bool(data["is_read"])
        db.session.commit()
        return success_response(
            "Notification updated successfully",
            data=_build_notification_payload(notification),
        )

    # Owner path
    pg, error = _get_owner_pg()
    if error:
        return error

    notification = (
        Notification.query
        .join(Member)
        .filter(
            Notification.notification_id == notification_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not notification:
        return error_response(
            "Notification not found",
            404,
        )

    if "title" in data:

        if not data["title"]:
            return error_response(
                "Title is required",
                400,
            )

        notification.title = data["title"]

    if "message" in data:

        if not data["message"]:
            return error_response(
                "Message is required",
                400,
            )

        notification.message = data["message"]

    if "type" in data:

        if data["type"] not in VALID_NOTIFICATION_TYPES:
            return error_response(
                "Invalid notification type",
                400,
            )

        notification.type = data["type"]

    if "is_read" in data:
        notification.is_read = bool(data["is_read"])

    db.session.commit()

    return success_response(
        "Notification updated successfully",
        data=_build_notification_payload(
            notification
        ),
    )



def delete_notification(notification_id):
    """Delete notification."""

    pg, error = _get_owner_pg()

    if error:
        return error

    notification = (
        Notification.query
        .join(Member)
        .filter(
            Notification.notification_id == notification_id,
            Member.pg_id == pg.pg_id,
        )
        .first()
    )

    if not notification:
        return error_response(
            "Notification not found",
            404,
        )

    db.session.delete(notification)
    db.session.commit()

    return success_response(
        "Notification deleted successfully",
    )