-- =========================================================
-- SmartPG Database
-- Table: pg
-- Description: Stores the PG profile for a single owner
-- =========================================================

CREATE TABLE pg (
    pg_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL UNIQUE,
    pg_name VARCHAR(100) NOT NULL,
    address TEXT,
    upi_id VARCHAR(100),
    absence_threshold INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pg_owner
        FOREIGN KEY (owner_id)
        REFERENCES owner (owner_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_pg_absence_threshold_positive
        CHECK (absence_threshold > 0)
);
