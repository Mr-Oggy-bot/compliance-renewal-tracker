
    CREATE TABLE IF NOT EXISTS organisations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      timezone TEXT DEFAULT 'UTC',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'manager', 'owner')) NOT NULL,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    );

    CREATE TABLE IF NOT EXISTS obligations (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      authority TEXT NOT NULL,
      frequency TEXT CHECK(frequency IN ('monthly', 'quarterly', 'yearly', 'three_yearly')) NOT NULL,
      lead_days INTEGER NOT NULL DEFAULT 30,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    );

    CREATE TABLE IF NOT EXISTS instances (
      id TEXT PRIMARY KEY,
      obligation_id TEXT NOT NULL REFERENCES obligations(id) ON DELETE CASCADE,
      cycle_no INTEGER NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'expired', 'renewed')) NOT NULL,
      certificate_no TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
      tier TEXT CHECK(tier IN ('t30', 't7', 't0')) NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
      sent_at TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
      UNIQUE(instance_id, tier)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
      file_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      uploaded_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    );

    CREATE INDEX IF NOT EXISTS idx_obligations_org ON obligations(org_id);
    CREATE INDEX IF NOT EXISTS idx_instances_obligation ON instances(obligation_id);
    CREATE INDEX IF NOT EXISTS idx_instances_dates ON instances(valid_from, valid_to);
    CREATE INDEX IF NOT EXISTS idx_reminders_status_due ON reminders(status, due_date);
  
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content BYTEA;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
