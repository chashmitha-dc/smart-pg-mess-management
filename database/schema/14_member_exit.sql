-- =========================================================
-- SmartPG Database
-- Table: member_exit
-- Description: Stores checkout and exit details for leaving members
-- =========================================================

CREATE TABLE member_exit (
    exit_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL UNIQUE,
    leaving_date DATE NOT NULL,
    reason TEXT,
    refund NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_member_exit_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_member_exit_refund_non_negative
        CHECK (refund >= 0)
);
