-- Migration: 003_leads_update (ROLLBACK)
-- Description: Rollback leads table structure changes
-- Created: 2025-01-22
-- Author: System

-- Drop new indexes
DROP INDEX IF EXISTS idx_leads_source;

-- Rename phone back to phone_number if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
        ALTER TABLE leads RENAME COLUMN phone TO phone_number;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sms_messages' AND column_name = 'phone') THEN
        ALTER TABLE sms_messages RENAME COLUMN phone TO phone_number;
    END IF;
END $$;

-- Drop source column
ALTER TABLE leads DROP COLUMN IF EXISTS source;

-- Recreate old indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone_number ON leads(phone_number);
