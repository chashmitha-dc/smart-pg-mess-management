-- =========================================================
-- SmartPG Database
-- Table: absence_request
-- Description: Stores member leave requests and owner decisions
-- =========================================================

CREATE TABLE absence_request (
    absence_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_absence_request_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_absence_request_status
        CHECK (status IN ('pending', 'approved', 'rejected')),

    CONSTRAINT chk_absence_request_dates
        CHECK (to_date >= from_date)
);
