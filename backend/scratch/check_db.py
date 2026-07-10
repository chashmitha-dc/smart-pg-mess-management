import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.database import db
from models.owner import Owner
from models.pg import PG
from models.meal_plan import MealPlan
from models.member import Member

with app.app_context():
    print("--- Owners ---")
    for o in Owner.query.all():
        print(f"ID: {o.owner_id}, Name: {o.name}, Email: {o.email}")
        
    print("\n--- PGs ---")
    for p in PG.query.all():
        print(f"PG ID: {p.pg_id}, Name: {p.pg_name}, Owner ID: {p.owner_id}")
        
    print("\n--- Meal Plans ---")
    for mp in MealPlan.query.all():
        print(f"Plan ID: {mp.plan_id}, Name: {mp.plan_name}, PG ID: {mp.pg_id}, Active: {mp.active}")

    print("\n--- Members ---")
    for m in Member.query.all():
        print(f"Member ID: {m.member_id}, Name: {m.member_name}, PG ID: {m.pg_id}, Plan ID: {m.current_plan_id}")
