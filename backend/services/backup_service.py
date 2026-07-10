import json
import io
from datetime import datetime, date
from decimal import Decimal
from flask import send_file
from flask_jwt_extended import get_jwt
from config.database import db
from utils.response import success_response, error_response

def db_backup():
    claims = get_jwt()
    if claims.get("role") != "owner":
        return error_response("Forbidden: Requires owner privileges", 403)
        
    metadata = db.metadata
    backup_data = {}
    
    # Export all registered tables
    for table_name, table in metadata.tables.items():
        # Query raw table rows
        rows = db.session.execute(table.select()).fetchall()
        table_rows = []
        for row in rows:
            row_dict = {}
            for column in table.columns:
                # row is a Row mapping, we can fetch by index or name
                val = getattr(row, column.name, None)
                if val is None:
                    # Try index-based fallback for older SQLAlchemy versions
                    try:
                        val = row[column.name]
                    except Exception:
                        pass
                
                if isinstance(val, (datetime, date)):
                    row_dict[column.name] = val.isoformat()
                elif isinstance(val, Decimal):
                    row_dict[column.name] = float(val)
                else:
                    row_dict[column.name] = val
            table_rows.append(row_dict)
        backup_data[table_name] = table_rows
        
    # Serialize to JSON byte stream
    json_bytes = json.dumps(backup_data, indent=2).encode("utf-8")
    return send_file(
        io.BytesIO(json_bytes),
        mimetype="application/json",
        as_attachment=True,
        download_name=f"smart_pg_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )

def db_restore(file_data):
    claims = get_jwt()
    if claims.get("role") != "owner":
        return error_response("Forbidden: Requires owner privileges", 403)
        
    try:
        data = json.loads(file_data.read().decode("utf-8"))
    except Exception as e:
        return error_response(f"Invalid backup file format: {str(e)}", 400)
        
    metadata = db.metadata
    sorted_tables = metadata.sorted_tables
    
    try:
        # Delete existing data in reverse dependency order
        for table in reversed(sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
        
        # Insert back table data in dependency order
        for table in sorted_tables:
            table_name = table.name
            if table_name in data:
                rows = data[table_name]
                for r in rows:
                    insert_dict = {}
                    for column in table.columns:
                        val = r.get(column.name)
                        if val is not None:
                            if "DATE" in str(column.type).upper() or "TIME" in str(column.type).upper():
                                if "TIME" in str(column.type).upper():
                                    insert_dict[column.name] = datetime.fromisoformat(val)
                                else:
                                    insert_dict[column.name] = date.fromisoformat(val)
                            else:
                                insert_dict[column.name] = val
                        else:
                            insert_dict[column.name] = None
                    db.session.execute(table.insert().values(**insert_dict))
                    
        db.session.commit()
        return success_response("Database restored successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Database restore failed: {str(e)}", 500)
