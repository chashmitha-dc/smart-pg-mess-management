-- =========================================================
-- SmartPG Database
-- Table: complaint
-- Description: Stores complaints raised by members
-- =========================================================

CREATE TABLE complaint (
    complaint_id SERIAL PRIMARY KEY,

    member_id INTEGER NOT NULL,

    category VARCHAR(50) NOT NULL,

    description TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'open',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMP,

    CONSTRAINT fk_complaint_member
        FOREIGN KEY (member_id)
        REFERENCES member(member_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_complaint_category
        CHECK (
            category IN (
                'food',
                'cleaning',
                'electricity',
                'water',
                'wifi',
                'maintenance',
                'other'
            )
        ),

    CONSTRAINT chk_complaint_status
        CHECK (
            status IN (
                'open',
                'in_progress',
                'resolved',
                'closed'
            )
        )
);