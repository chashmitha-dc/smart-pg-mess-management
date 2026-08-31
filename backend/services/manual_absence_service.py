# Service for handling manual absence adjustments

from flask_jwt_extended import get_jwt_identity
from config.database import db
from models.member import Member
from models.pg import PG
from models.manual_absence_adjustment import ManualAbsenceAdjustment
from utils.response import error_response, success_response
from models.meal_plan import MealPlan
from models.meal_price import MealPrice
from services.billing_service import _get_member_billing_period, _get_owner_pg

def create_manual_absence_adjustment(member_id, absent_days, reason=None):
    """Owner creates a manual absence deduction for a member.
    Calculates deduction using daily meal rate and 7‑day rule.
    Allows replacing existing adjustment for the same billing period with different absent_days.
    """
    # Identify owner from JWT
    owner_id = int(get_jwt_identity())

    # Verify owner PG
    pg, err = _get_owner_pg()
    if err:
        return err

    # Verify member belongs to this PG
    member = Member.query.filter_by(pg_id=pg.pg_id, member_id=member_id).first()
    if not member:
        return error_response("Member not found or not part of owner's PG", 404)

    if absent_days is None or absent_days < 0:
        return error_response("Invalid absent_days value", 400)

    # Determine billing period for the member
    billing_period_start, billing_period_end = _get_member_billing_period(member)

    # Check if any adjustment already exists for this member & period
    existing_adjustments = ManualAbsenceAdjustment.query.filter_by(
        member_id=member.member_id,
        billing_period_start=billing_period_start,
        status="applied",
    ).all()
    
    # If an adjustment with the same absent_days exists, return success (idempotent)
    if existing_adjustments:
        for adj in existing_adjustments:
            if adj.absent_days == absent_days and adj.reason == reason:
                # Already exists with same parameters, return success (no error)
                return success_response("Manual absence adjustment already exists", data={
                    "adjustment_id": adj.id,
                    "member_id": adj.member_id,
                    "absent_days": adj.absent_days,
                    "deduction_amount": float(adj.deduction_amount),
                    "billing_period_start": adj.billing_period_start.isoformat(),
                    "billing_period_end": adj.billing_period_end.isoformat(),
                })
        
        # If different absent_days, delete old records and create new one
        for adj in existing_adjustments:
            db.session.delete(adj)

    # Calculate daily rate (same as bill generation)
    meal_plan = MealPlan.query.filter_by(pg_id=pg.pg_id, plan_id=member.current_plan_id).first()
    if not meal_plan:
        return error_response("Member meal plan not found", 404)
    meal_price = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()
    if not meal_price:
        return error_response("Meal price not found", 404)

    daily_cost = 0.00
    if meal_plan.breakfast and meal_price.breakfast_price is not None:
        daily_cost += float(meal_price.breakfast_price)
    if meal_plan.lunch and meal_price.lunch_price is not None:
        daily_cost += float(meal_price.lunch_price)
    if meal_plan.dinner and meal_price.dinner_price is not None:
        daily_cost += float(meal_price.dinner_price)

    # Apply 7‑day rule
    deduction_amount = absent_days * daily_cost if absent_days >= 7 else 0.0

    # Create new adjustment
    adjustment = ManualAbsenceAdjustment(
        owner_id=owner_id,
        member_id=member.member_id,
        billing_period_start=billing_period_start,
        billing_period_end=billing_period_end,
        absent_days=absent_days,
        daily_rate=daily_cost,
        deduction_amount=deduction_amount,
        reason=reason,
        status="applied",
    )
    db.session.add(adjustment)
    db.session.commit()
    
    return success_response("Manual absence adjustment created", data={
        "adjustment_id": adjustment.id,
        "member_id": adjustment.member_id,
        "absent_days": adjustment.absent_days,
        "deduction_amount": float(adjustment.deduction_amount),
        "billing_period_start": adjustment.billing_period_start.isoformat(),
        "billing_period_end": adjustment.billing_period_end.isoformat(),
    })
