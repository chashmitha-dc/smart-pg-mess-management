from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash
from config.database import db
from models.owner import Owner
from utils.response import success_response, error_response

def get_owner_profile():
    owner_id = int(get_jwt_identity())
    owner = Owner.query.get(owner_id)

    if not owner:
        return error_response("Owner not found", 404)

    return success_response(
        "Owner profile fetched successfully",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "phone": owner.phone,
            "profile_photo": owner.profile_photo,
        },
    )

def update_owner_profile(data):
    owner_id = int(get_jwt_identity())
    owner = Owner.query.get(owner_id)

    if not owner:
        return error_response("Owner not found", 404)

    if "name" in data:
        owner.name = data["name"]
    if "email" in data:
        owner.email = data["email"]
    if "phone" in data:
        owner.phone = data["phone"]
    if "profile_photo" in data:
        owner.profile_photo = data["profile_photo"]
    if "password" in data and data["password"]:
        owner.password = generate_password_hash(data["password"])

    db.session.commit()

    return success_response(
        "Owner profile updated successfully",
        data={
            "owner_id": owner.owner_id,
            "name": owner.name,
            "email": owner.email,
            "phone": owner.phone,
            "profile_photo": owner.profile_photo,
        },
    )


def get_billing_increment_settings():
    from models.pg import PG
    from models.member import Member
    from models.meal_price import MealPrice

    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return error_response("PG not found", 404)

    active_members = Member.query.filter_by(pg_id=pg.pg_id, status="active").all()
    meal_price = MealPrice.query.filter_by(pg_id=pg.pg_id, active=True).first()

    # Determine standard increment amount (find non-zero increment or default 200)
    current_increment = 200.0
    for m in active_members:
        if m.billing_increment and float(m.billing_increment) > 0:
            current_increment = float(m.billing_increment)
            break

    members_list = []
    for m in active_members:
        daily_cost = 0.0
        plan_name = "No Plan"
        if m.current_plan:
            plan_name = m.current_plan.plan_name
            if meal_price:
                if m.current_plan.breakfast and meal_price.breakfast_price is not None:
                    daily_cost += float(meal_price.breakfast_price)
                if m.current_plan.lunch and meal_price.lunch_price is not None:
                    daily_cost += float(meal_price.lunch_price)
                if m.current_plan.dinner and meal_price.dinner_price is not None:
                    daily_cost += float(meal_price.dinner_price)

        base_monthly = daily_cost * 30
        inc_val = float(m.billing_increment or 0.0)
        is_selected = inc_val > 0

        members_list.append({
            "member_id": m.member_id,
            "member_name": m.member_name,
            "phone": m.phone,
            "plan_name": plan_name,
            "daily_cost": daily_cost,
            "base_monthly_amount": base_monthly,
            "billing_increment": inc_val,
            "selected": is_selected,
        })

    return success_response(
        "Billing increment settings fetched successfully",
        data={
            "increment_amount": current_increment,
            "members": members_list,
        },
    )


def update_billing_increment_settings(data):
    from models.pg import PG
    from models.member import Member

    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()

    if not pg:
        return error_response("PG not found", 404)

    try:
        increment_amount = float(data.get("increment_amount", 0.0))
    except (ValueError, TypeError):
        return error_response("Invalid increment amount", 400)

    if increment_amount < 0:
        return error_response("Increment amount cannot be negative", 400)

    selected_ids = set()
    raw_ids = data.get("selected_member_ids", [])
    if isinstance(raw_ids, list):
        for item in raw_ids:
            try:
                selected_ids.add(int(item))
            except (ValueError, TypeError):
                pass

    active_members = Member.query.filter_by(pg_id=pg.pg_id, status="active").all()

    updated_count = 0
    for m in active_members:
        if m.member_id in selected_ids:
            m.billing_increment = increment_amount
            updated_count += 1
        else:
            m.billing_increment = 0.0

    db.session.commit()

    return success_response(
        f"Billing increment settings saved successfully. Updated {updated_count} member(s).",
        data={
            "increment_amount": increment_amount,
            "updated_count": updated_count,
        },
    )