-- =========================================================
-- SmartPG Database
-- Table: notification
-- Description: Stores notifications sent to members
-- =========================================================

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,

    member_id INTEGER NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(30) NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_member
        FOREIGN KEY (member_id)
        REFERENCES member(member_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_notification_type
        CHECK (
            type IN (
                'info',
                'warning',
                'bill',
                'complaint',
                'meal',
                'payment',
                'system'
            )
        )
);