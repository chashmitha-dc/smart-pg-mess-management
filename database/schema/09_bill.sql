-- =========================================================
-- SmartPG Database
-- Table: bill
-- Description: Stores bills generated for each member
-- =========================================================

CREATE TABLE bill (
    bill_id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    original_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    absence_deduction NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    manual_discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    late_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bill_member
        FOREIGN KEY (member_id)
        REFERENCES member (member_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_bill_amounts_non_negative
        CHECK (original_amount >= 0 AND absence_deduction >= 0 AND manual_discount >= 0 AND late_fee >= 0 AND final_amount >= 0 AND paid_amount >= 0 AND balance_amount >= 0),

    CONSTRAINT chk_bill_status
        CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),

    CONSTRAINT chk_bill_period_dates
        CHECK (billing_period_end >= billing_period_start)
);
