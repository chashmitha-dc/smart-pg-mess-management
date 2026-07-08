-- =========================================================
-- SmartPG Database
-- Table: owner
-- Description: Stores PG owner account information
-- =========================================================

CREATE TABLE owner (

    owner_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(15) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);