from flask_jwt_extended import get_jwt_identity

from models.pg import PG
from models.member import Member
from models.bill import Bill
from models.payment import Payment
from models.complaint import Complaint
from models.food_prediction import FoodPrediction

from utils.response import success_response, error_response
from services.billing_service import get_due_billing_members_list

from sqlalchemy import func


def dashboard_summary():
    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return success_response(
            "Dashboard fetched successfully",
            data={
                "total_members": 0,
                "active_members": 0,
                "total_revenue": 0.0,
                "pending_bills": 0,
                "open_complaints": 0,
                "todays_notifications": 0,
                "prediction": None,
                "due_billing_members": []
            }
        )

    total_members = Member.query.filter_by(pg_id=pg.pg_id).count()
    active_members = Member.query.filter_by(pg_id=pg.pg_id, status="active").count()

    total_revenue = (
        Payment.query
        .join(Bill)
        .join(Member)
        .filter(Member.pg_id == pg.pg_id, Payment.verification_status == "verified")
        .with_entities(func.sum(Payment.amount))
        .scalar()
    ) or 0

    pending_bills = (
        Bill.query
        .join(Member)
        .filter(
            Member.pg_id == pg.pg_id,
            Bill.status != "paid"
        )
        .count()
    )

    open_complaints = (
        Complaint.query
        .join(Member)
        .filter(
            Member.pg_id == pg.pg_id,
            Complaint.status.in_(["open", "in_progress"])
        )
        .count()
    )

    from datetime import datetime, time, date
    today_start = datetime.combine(date.today(), time.min)
    from models.notification import Notification
    todays_notifications = (
        Notification.query
        .join(Member)
        .filter(
            Member.pg_id == pg.pg_id,
            Notification.created_at >= today_start
        )
        .count()
    )

    latest_prediction = (
        FoodPrediction.query
        .filter_by(pg_id=pg.pg_id)
        .order_by(FoodPrediction.prediction_date.desc())
        .first()
    )

    prediction = None
    if latest_prediction:
        prediction = {
            "date": latest_prediction.prediction_date.isoformat(),
            "breakfast": latest_prediction.expected_breakfast,
            "lunch": latest_prediction.expected_lunch,
            "dinner": latest_prediction.expected_dinner
        }

    due_billing_members = get_due_billing_members_list(pg.pg_id)

    return success_response(
        "Dashboard fetched successfully",
        data={
            "total_members": total_members,
            "active_members": active_members,
            "total_revenue": float(total_revenue),
            "pending_bills": pending_bills,
            "open_complaints": open_complaints,
            "todays_notifications": todays_notifications,
            "prediction": prediction,
            "due_billing_members": due_billing_members
        }
    )