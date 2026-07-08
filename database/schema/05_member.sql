-- =========================================================
-- SmartPG Database
-- Table: member
-- Description: Stores members staying in the PG
-- =========================================================

CREATE TABLE member (
    member_id SERIAL PRIMARY KEY,
    pg_id INTEGER NOT NULL,
    current_plan_id INTEGER NOT NULL,

    member_name VARCHAR(100) NOT NULL,

    phone VARCHAR(20) UNIQUE NOT NULL,

    emergency_contact VARCHAR(20) NOT NULL,

    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,

    billing_start_date DATE NOT NULL DEFAULT CURRENT_DATE,

    next_billing_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT fk_member_pg
        FOREIGN KEY (pg_id)
        REFERENCES pg (pg_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_current_plan
        FOREIGN KEY (current_plan_id)
        REFERENCES meal_plan (plan_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_member_status
        CHECK (
            status IN (
                'active',
                'inactive',
                'left',
                'suspended'
            )
        )
);