"""Routes for notification management."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.notification_service import (
    create_notification,
    get_notifications,
    get_notification,
    update_notification,
    delete_notification,
)

notification_bp = Blueprint("notification", __name__)


@notification_bp.route("/", methods=["POST"])
@jwt_required()
def add_notification():
    """Create a notification."""
    data = request.get_json(silent=True) or {}
    return create_notification(data)


@notification_bp.route("/", methods=["GET"])
@jwt_required()
def list_notifications():
    """Return all notifications."""
    return get_notifications()


@notification_bp.route("/<int:notification_id>", methods=["GET"])
@jwt_required()
def view_notification(notification_id):
    """Return one notification."""
    return get_notification(notification_id)


@notification_bp.route("/<int:notification_id>", methods=["PUT"])
@jwt_required()
def edit_notification(notification_id):
    """Update notification."""
    data = request.get_json(silent=True) or {}
    return update_notification(notification_id, data)


@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def remove_notification(notification_id):
    """Delete notification."""
    return delete_notification(notification_id)