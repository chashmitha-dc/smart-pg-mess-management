-- =========================================================
-- SmartPG Database
-- Table: food_prediction
-- Description: Stores AI-based food consumption predictions
-- =========================================================

CREATE TABLE food_prediction (
    prediction_id SERIAL PRIMARY KEY,
    pg_id INTEGER NOT NULL,
    prediction_date DATE NOT NULL,
    expected_breakfast INTEGER NOT NULL DEFAULT 0,
    expected_lunch INTEGER NOT NULL DEFAULT 0,
    expected_dinner INTEGER NOT NULL DEFAULT 0,
    actual_breakfast INTEGER NOT NULL DEFAULT 0,
    actual_lunch INTEGER NOT NULL DEFAULT 0,
    actual_dinner INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5, 2),

    CONSTRAINT fk_food_prediction_pg
        FOREIGN KEY (pg_id)
        REFERENCES pg (pg_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_food_prediction_pg_date
        UNIQUE (pg_id, prediction_date),

    CONSTRAINT chk_food_prediction_counts_non_negative
        CHECK (expected_breakfast >= 0 AND expected_lunch >= 0 AND expected_dinner >= 0 AND actual_breakfast >= 0 AND actual_lunch >= 0 AND actual_dinner >= 0)
);
