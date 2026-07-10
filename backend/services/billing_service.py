"""Service layer for billing generation and retrieval."""

from datetime import date, timedelta

from flask_jwt_extended import get_jwt_identity, get_jwt

from config.database import db
from models.absence_request import AbsenceRequest
from models.bill import Bill
from models.meal_plan import MealPlan
from models.meal_price import MealPrice
from models.member import Member
from models.pg import PG
from models.notification import Notification
from utils.response import error_response, success_response
from utils.sms_utils import send_bill_notification_sms
from utils.email_utils import send_bill_reminder_email


def _get_owner_pg():
    """Return the PG for the logged-in owner."""
    owner_id = int(get_jwt_identity())

    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return None, error_response("PG not found", 404)

    return pg, None


def _get_member_billing_period(member):
    """Return billing period dates for a specific member using their billing_start_date."""
    billing_period_start = member.billing_start_date
    billing_period_end = member.next_billing_date - timedelta(days=1)
    return billing_period_start, billing_period_end


def generate_member_bill(member_id):
    """Generate a bill for a single active member."""
    pg, error = _get_owner_pg()
    if error:
        return error

    member = Member.query.filter_by(pg_id=pg.pg_id, member_id=member_id).first()

    if not member:
        return error_response("Member not found", 404)

    if member.status != "active":
        return error_response("Only active members can have bills generated", 400)

    billing_period_start, billing_period_end = _get_member_billing_period(member)
    bill, bill_error = _generate_bill_for_member(
        member,
        pg,
        billing_period_start,
        billing_period_end,
    )

    if bill_error:
        return bill_error

    # Advance next_billing_date by 30 days after successful bill generation
    member.billing_start_date = member.next_billing_date
    member.next_billing_date = member.next_billing_date + timedelta(days=30)
    db.session.commit()

    return success_response(
        "Bill generated successfully",
        data=_build_bill_payload(bill),
        status_code=201,
    )


def generate_all_bills():
    """Generate bills for every due active member in the owner's PG."""
    pg, error = _get_owner_pg()
    if error:
        return error

    # Only retrieve active members whose next billing date has arrived
    members = Member.query.filter(
        Member.pg_id == pg.pg_id,
        Member.status == "active",
        Member.next_billing_date <= date.today()
    ).all()

    created_bills = []
    skipped_members = 0

    for member in members:
        billing_period_start, billing_period_end = _get_member_billing_period(member)
        bill, bill_error = _generate_bill_for_member(
            member,
            pg,
            billing_period_start,
            billing_period_end,
        )

        if bill_error:
            skipped_members += 1
            continue

        # Advance next_billing_date by 30 days after successful bill generation
        member.billing_start_date = member.next_billing_date
        member.next_billing_date = member.next_billing_date + timedelta(days=30)

        created_bills.append(_build_bill_payload(bill))

    db.session.commit()

    return success_response(
        "Bills generated successfully",
        data={
            "generated_count": len(created_bills),
            "skipped_count": skipped_members,
            "bills": created_bills,
        },
        status_code=201,
    )


def _get_approved_leave_days(member_id, billing_period_start, billing_period_end):
    """Count approved leave days within the billing period."""
    approved_leaves = AbsenceRequest.query.filter(
        AbsenceRequest.member_id == member_id,
        AbsenceRequest.status == "approved",
        AbsenceRequest.from_date <= billing_period_end,
        AbsenceRequest.to_date >= billing_period_start,
    ).all()

    approved_days = 0

    for leave in approved_leaves:
        overlap_start = max(leave.from_date, billing_period_start)
        overlap_end = min(leave.to_date, billing_period_end)
        if overlap_start <= overlap_end:
            approved_days += (overlap_end - overlap_start).days + 1

    return approved_days


def _build_bill_payload(bill):
    """Convert a bill record into a JSON-friendly payload."""
    return {
        "bill_id": bill.bill_id,
        "member_id": bill.member_id,
        "member_name": bill.member.member_name if bill.member else "Unknown",
        "billing_period_start": bill.billing_period_start.isoformat(),
        "billing_period_end": bill.billing_period_end.isoformat(),
        "original_amount": float(bill.original_amount),
        "absence_deduction": float(bill.absence_deduction),
        "manual_discount": float(bill.manual_discount),
        "late_fee": float(bill.late_fee),
        "final_amount": float(bill.final_amount),
        "paid_amount": float(bill.paid_amount),
        "balance_amount": float(bill.balance_amount),
        "status": bill.status,
        "generated_at": bill.generated_at.isoformat(),
    }


def _generate_bill_for_member(member, pg, billing_period_start, billing_period_end):
    """Generate a bill for a single active member."""
    existing_bill = Bill.query.filter_by(
        member_id=member.member_id,
        billing_period_start=billing_period_start,
        billing_period_end=billing_period_end,
    ).first()

    if existing_bill:
        return None, error_response("Bill already exists for this member and billing period", 409)

    meal_plan = MealPlan.query.filter_by(
        pg_id=pg.pg_id,
        plan_id=member.current_plan_id,
    ).first()

    if not meal_plan:
        return None, error_response("Member meal plan not found", 404)

    meal_price = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()

    if not meal_price:
        return None, error_response("Meal price not found", 404)

    daily_cost = 0.00
    if meal_plan.breakfast and meal_price.breakfast_price is not None:
        daily_cost += float(meal_price.breakfast_price)
    if meal_plan.lunch and meal_price.lunch_price is not None:
        daily_cost += float(meal_price.lunch_price)
    if meal_plan.dinner and meal_price.dinner_price is not None:
        daily_cost += float(meal_price.dinner_price)

    monthly_cost = daily_cost * 30
    approved_leave_days = _get_approved_leave_days(
        member.member_id,
        billing_period_start,
        billing_period_end,
    )
    absence_deduction = approved_leave_days * daily_cost
    final_amount = monthly_cost - absence_deduction

    new_bill = Bill(
        member_id=member.member_id,
        billing_period_start=billing_period_start,
        billing_period_end=billing_period_end,
        original_amount=monthly_cost,
        absence_deduction=absence_deduction,
        manual_discount=0,
        late_fee=0,
        final_amount=final_amount,
        paid_amount=0,
        balance_amount=final_amount,
        status="pending",
    )

    db.session.add(new_bill)

    # Notify member about generated bill
    notification = Notification(
        member_id=member.member_id,
        title="New Bill Generated",
        message=f"Your bill of ₹{final_amount:.2f} for the period {billing_period_start.strftime('%d %b %Y')} to {billing_period_end.strftime('%d %b %Y')} has been generated.",
        type="bill",
        is_read=False
    )
    db.session.add(notification)

    # Send simulated SMS to member
    if member.phone:
        send_bill_notification_sms(
            phone=member.phone,
            member_name=member.member_name,
            amount=final_amount,
            start_date=billing_period_start,
            end_date=billing_period_end
        )

    # Send email reminder to member if configured
    if member.email:
        send_bill_reminder_email(
            to_email=member.email,
            member_name=member.member_name,
            amount=final_amount,
            start_date=billing_period_start,
            end_date=billing_period_end,
            pg_name=pg.pg_name if pg else "SmartPG"
        )

    db.session.commit()

    return new_bill, None


def get_bills():
    """Return all bills."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        bills = (
            Bill.query.filter_by(member_id=member_id)
            .order_by(Bill.billing_period_end.desc())
            .all()
        )
    else:
        pg, error = _get_owner_pg()
        if error:
            if isinstance(error, tuple) and len(error) > 1 and error[1] == 404:
                return success_response("Bills fetched successfully", data=[])
            return error
        bills = (
            Bill.query.join(Member)
            .filter(Member.pg_id == pg.pg_id)
            .order_by(Bill.billing_period_end.desc())
            .all()
        )

    bill_data = [_build_bill_payload(bill) for bill in bills]

    return success_response("Bills fetched successfully", data=bill_data)


def get_bill(bill_id):
    """Return one bill."""
    claims = get_jwt()
    role = claims.get("role", "owner")

    if role == "member":
        member_id = int(get_jwt_identity())
        bill = Bill.query.filter_by(bill_id=bill_id, member_id=member_id).first()
    else:
        pg, error = _get_owner_pg()
        if error:
            return error
        bill = (
            Bill.query.join(Member)
            .filter(Bill.bill_id == bill_id, Member.pg_id == pg.pg_id)
            .first()
        )

    if not bill:
        return error_response("Bill not found", 404)

    return success_response(
        "Bill fetched successfully",
        data=_build_bill_payload(bill),
    )


def get_due_billing_members_list(pg_id):
    """Return a list of active members whose billing cycle is complete and due."""
    members = Member.query.filter_by(pg_id=pg_id, status="active").all()
    due_list = []
    
    today_val = date.today()
    for member in members:
        if today_val >= member.next_billing_date:
            billing_period_start, billing_period_end = _get_member_billing_period(member)
            
            # Calculate due amount
            meal_plan = MealPlan.query.filter_by(
                pg_id=pg_id,
                plan_id=member.current_plan_id,
            ).first()
            
            meal_price = MealPrice.query.filter_by(pg_id=pg_id, active=True).first()
            
            if not meal_plan or not meal_price:
                continue
                
            daily_cost = 0.00
            if meal_plan.breakfast and meal_price.breakfast_price is not None:
                daily_cost += float(meal_price.breakfast_price)
            if meal_plan.lunch and meal_price.lunch_price is not None:
                daily_cost += float(meal_price.lunch_price)
            if meal_plan.dinner and meal_price.dinner_price is not None:
                daily_cost += float(meal_price.dinner_price)
                
            monthly_cost = daily_cost * 30
            approved_leave_days = _get_approved_leave_days(
                member.member_id,
                billing_period_start,
                billing_period_end,
            )
            absence_deduction = approved_leave_days * daily_cost
            final_amount = monthly_cost - absence_deduction
            
            due_list.append({
                "member_id": member.member_id,
                "member_name": member.member_name,
                "due_amount": float(final_amount),
            })
            
    return due_list
