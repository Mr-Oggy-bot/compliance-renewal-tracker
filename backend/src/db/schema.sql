-- PostgreSQL Production Schema for Compliance Renewal Tracker
-- 6 tables with UUIDs, audit timestamps, and relational constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'owner')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    authority VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'three_yearly')) NOT NULL,
    lead_days INTEGER NOT NULL DEFAULT 30,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obligation_id UUID NOT NULL REFERENCES obligations(id) ON DELETE CASCADE,
    cycle_no INTEGER NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('active', 'expired', 'renewed')) NOT NULL,
    certificate_no VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    tier VARCHAR(10) CHECK (tier IN ('t30', 't7', 't0')) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_instance_tier UNIQUE (instance_id, tier)
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    file_key VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obligations_org ON obligations(org_id);
CREATE INDEX IF NOT EXISTS idx_instances_obligation ON instances(obligation_id);
CREATE INDEX IF NOT EXISTS idx_instances_dates ON instances(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_reminders_status_due ON reminders(status, due_date);
