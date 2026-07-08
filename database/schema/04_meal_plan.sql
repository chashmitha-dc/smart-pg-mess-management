-- =========================================================
-- SmartPG Database
-- Table: meal_plan
-- Description: Stores meal combinations available for a PG
-- =========================================================

CREATE TABLE meal_plan (
    plan_id SERIAL PRIMARY KEY,
    pg_id INTEGER NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    breakfast BOOLEAN NOT NULL DEFAULT FALSE,
    lunch BOOLEAN NOT NULL DEFAULT FALSE,
    dinner BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_meal_plan_pg
        FOREIGN KEY (pg_id)
        REFERENCES pg (pg_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_meal_plan_pg_name
        UNIQUE (pg_id, plan_name)
);
