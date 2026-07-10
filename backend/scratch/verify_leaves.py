import os, sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.database import db
from models.absence_request import AbsenceRequest
from models.member import Member
from models.pg import PG
from models.owner import Owner

with app.app_context():
    # Find last 5 leaves
    leaves = AbsenceRequest.query.order_by(AbsenceRequest.requested_at.desc()).limit(5).all()
    print("=== LAST 5 LEAVE REQUESTS ===")
    for l in leaves:
        print(f"ID: {l.absence_id} | Member ID: {l.member_id} | Status: {l.status} | Requested At: {l.requested_at}")
        member = db.session.get(Member, l.member_id)
        if member:
            print(f"  Member Name: {member.member_name} | PG ID: {member.pg_id}")
            pg = db.session.get(PG, member.pg_id)
            if pg:
                print(f"    PG Name: {pg.pg_name} | Owner ID: {pg.owner_id}")
                owner = db.session.get(Owner, pg.owner_id)
                if owner:
                    print(f"      Owner Name: {owner.name} | Owner Email: {owner.email}")
