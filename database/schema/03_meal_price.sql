-- =========================================================
-- SmartPG Database
-- Table: meal_price
-- Description: Stores meal prices defined per PG
-- =========================================================

CREATE TABLE meal_price (
    price_id SERIAL PRIMARY KEY,
    pg_id INTEGER NOT NULL,
    breakfast_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    lunch_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dinner_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    effective_from DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_meal_price_pg
        FOREIGN KEY (pg_id)
        REFERENCES pg (pg_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_meal_price_non_negative
        CHECK (breakfast_price >= 0 AND lunch_price >= 0 AND dinner_price >= 0)
);
