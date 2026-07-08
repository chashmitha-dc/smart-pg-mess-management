-- =========================================================
-- SmartPG Database
-- Table: meal_confirmation
-- Description: Stores daily meal confirmation for each member
-- =========================================================

CREATE TABLE meal_confirmation (
    confirmation_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    date DATE NOT NULL,
    breakfast BOOLEAN NOT NULL DEFAULT FALSE,
    lunch BOOLEAN NOT NULL DEFAULT FALSE,
    dinner BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_meal_confirmation_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_meal_confirmation_member_date
        UNIQUE (member_id, date)
);
