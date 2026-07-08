# Database Schema Organization

Keep each table definition in its own SQL file under this directory.

Recommended convention:
- One file per table: `table_name.sql`
- Use clear, descriptive names
- Keep DDL focused on a single table per file
- Add migrations separately under `database/migrations/`
