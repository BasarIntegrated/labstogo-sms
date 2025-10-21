-- Rollback migration: 008_add_retry_tracking
-- Remove retry tracking fields from sms_messages table

-- Drop indexes first
DROP INDEX IF EXISTS idx_sms_messages_retry_count;
DROP INDEX IF EXISTS idx_sms_messages_last_retry;

-- Remove columns
ALTER TABLE sms_messages 
DROP COLUMN IF EXISTS retry_count,
DROP COLUMN IF EXISTS last_retry_at;
