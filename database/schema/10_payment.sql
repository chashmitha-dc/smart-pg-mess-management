-- =========================================================
-- SmartPG Database
-- Table: payment
-- Description: Stores all payments applied to a bill
-- =========================================================

CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,

    bill_id INTEGER NOT NULL,

    amount NUMERIC(10,2) NOT NULL,

    payment_method VARCHAR(30) NOT NULL,

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    transaction_id VARCHAR(100) UNIQUE,

    payment_proof VARCHAR(255),

    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    remarks TEXT,

    CONSTRAINT fk_payment_bill
        FOREIGN KEY (bill_id)
        REFERENCES bill (bill_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_payment_amount_positive
        CHECK (amount > 0),

    CONSTRAINT chk_payment_method
        CHECK (
            payment_method IN (
                'cash',
                'upi',
                'bank_transfer'
            )
        ),

    CONSTRAINT chk_payment_verification_status
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected'
            )
        )
);