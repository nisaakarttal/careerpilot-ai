-- Sprint 3 compatibility migration.
-- Existing chat sessions are interview sessions, so the default preserves behavior.
ALTER TABLE chatsessions
    ADD COLUMN IF NOT EXISTS assistant_type VARCHAR(32) NOT NULL DEFAULT 'interview';

CREATE INDEX IF NOT EXISTS ix_chatsessions_assistant_type
    ON chatsessions (assistant_type);

ALTER TABLE chatsessions
    ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'active';

ALTER TABLE chatsessions
    ADD COLUMN IF NOT EXISTS session_result JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE chatsessions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE chatsessions
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS ix_chatsessions_status
    ON chatsessions (status);
