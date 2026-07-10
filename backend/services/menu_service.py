from datetime import date
# pyrefly: ignore [missing-import]
from flask_jwt_extended import get_jwt_identity, get_jwt
from config.database import db
from models.menu import Menu
from models.pg import PG
from models.member import Member
from utils.response import success_response, error_response

def _get_owner_pg():
    owner_id = int(get_jwt_identity())
    pg = PG.query.filter_by(owner_id=owner_id).first()
    if not pg:
        return None, error_response("PG not found", 404)
    return pg, None

def _get_pg_id_by_role():
    claims = get_jwt()
    role = claims.get("role", "owner")
    
    if role == "member":
        member_id = int(get_jwt_identity())
        member = Member.query.get(member_id)
        if not member:
            return None, error_response("Member not found", 404)
        return member.pg_id, None
    else:
        pg, error = _get_owner_pg()
        if error:
            return None, error
        return pg.pg_id, None

def set_menu(data):
    """Create or update daily menu."""
    claims = get_jwt()
    if claims.get("role") != "owner":
        return error_response("Access forbidden: requires owner role", 403)
        
    pg, error = _get_owner_pg()
    if error:
        return error
        
    menu_date_str = data.get("menu_date")
    if not menu_date_str:
        return error_response("Menu date is required", 400)
        
    try:
        menu_date = date.fromisoformat(menu_date_str)
    except ValueError:
        return error_response("Invalid date format. Use YYYY-MM-DD", 400)
        
    breakfast = data.get("breakfast")
    lunch = data.get("lunch")
    dinner = data.get("dinner")
    
    menu = Menu.query.filter_by(pg_id=pg.pg_id, menu_date=menu_date).first()
    
    if menu:
        menu.breakfast = breakfast
        menu.lunch = lunch
        menu.dinner = dinner
        message = "Menu updated successfully"
    else:
        menu = Menu(
            pg_id=pg.pg_id,
            menu_date=menu_date,
            breakfast=breakfast,
            lunch=lunch,
            dinner=dinner
        )
        db.session.add(menu)
        message = "Menu created successfully"
        
    db.session.commit()
    
    return success_response(
        message,
        data={
            "menu_id": menu.menu_id,
            "menu_date": menu.menu_date.isoformat(),
            "breakfast": menu.breakfast,
            "lunch": menu.lunch,
            "dinner": menu.dinner
        }
    )

def get_menu_by_date(date_str):
    """Retrieve menu for a specific date."""
    pg_id, error = _get_pg_id_by_role()
    if error:
        return error
        
    try:
        menu_date = date.fromisoformat(date_str) if date_str else date.today()
    except ValueError:
        return error_response("Invalid date format. Use YYYY-MM-DD", 400)
        
    menu = Menu.query.filter_by(pg_id=pg_id, menu_date=menu_date).first()
    
    if not menu:
        return success_response(
            "No menu found for this date",
            data={
                "menu_date": menu_date.isoformat(),
                "breakfast": "",
                "lunch": "",
                "dinner": ""
            }
        )
        
    return success_response(
        "Menu fetched successfully",
        data={
            "menu_id": menu.menu_id,
            "menu_date": menu.menu_date.isoformat(),
            "breakfast": menu.breakfast,
            "lunch": menu.lunch,
            "dinner": menu.dinner
        }
    )

def get_menu_range(start_date_str, end_date_str):
    """Retrieve menu records for a range of dates."""
    pg_id, error = _get_pg_id_by_role()
    if error:
        return error
        
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return error_response("Invalid date formats. Use YYYY-MM-DD", 400)
        
    menus = Menu.query.filter(
        Menu.pg_id == pg_id,
        Menu.menu_date >= start_date,
        Menu.menu_date <= end_date
    ).order_by(Menu.menu_date.asc()).all()
    
    menu_data = [
        {
            "menu_id": m.menu_id,
            "menu_date": m.menu_date.isoformat(),
            "breakfast": m.breakfast,
            "lunch": m.lunch,
            "dinner": m.dinner
        }
        for m in menus
    ]
    
    return success_response("Menus fetched successfully", data=menu_data)
