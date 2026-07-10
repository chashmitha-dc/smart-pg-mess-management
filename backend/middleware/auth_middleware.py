from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from utils.response import error_response

def role_required(role):
    """Decorator to restrict routes to specific roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get("role")
                
                # If role is not in claims, fallback check (e.g. legacy tokens might not have role, treat as owner)
                if not user_role and role == "owner":
                    user_role = "owner"
                
                if user_role != role:
                    return error_response(f"Access forbidden: requires {role} role", 403)
                
                return fn(*args, **kwargs)
            except Exception as e:
                return error_response(str(e), 401)
        return wrapper
    return decorator

def owner_required(fn):
    """Decorator for routes that require owner access."""
    return role_required("owner")(fn)

def member_required(fn):
    """Decorator for routes that require member access."""
    return role_required("member")(fn)
