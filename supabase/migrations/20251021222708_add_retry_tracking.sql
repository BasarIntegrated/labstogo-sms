-- Add retry tracking fields to sms_messages table
-- Migration: add_retry_tracking

-- Add retry count and last retry timestamp
ALTER TABLE sms_messages 
ADD COLUMN retry_count INTEGER DEFAULT 0,
ADD COLUMN last_retry_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance on retry queries
CREATE INDEX IF NOT EXISTS idx_sms_messages_retry_count ON sms_messages(retry_count);
CREATE INDEX IF NOT EXISTS idx_sms_messages_last_retry ON sms_messages(last_retry_at);

-- Add comment for documentation
COMMENT ON COLUMN sms_messages.retry_count IS 'Number of retry attempts for this SMS message';
COMMENT ON COLUMN sms_messages.last_retry_at IS 'Timestamp of the last retry attempt';
