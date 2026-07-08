-- =========================================================
-- SmartPG Database
-- Table: member_plan_history
-- Description: Tracks all meal plan changes for a member
-- =========================================================

CREATE TABLE member_plan_history (
    history_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_member_plan_history_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_plan_history_plan
        FOREIGN KEY (plan_id)
        REFERENCES meal_plan (plan_id)
        ON DELETE RESTRICT
);
