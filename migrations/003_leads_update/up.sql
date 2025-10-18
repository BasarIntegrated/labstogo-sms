-- Migration: 003_leads_update
-- Description: Update leads table structure for CSV compatibility
-- Created: 2025-01-22
-- Author: System

-- Add new columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- Drop columns if they exist (cleanup from previous versions)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'title') THEN
        ALTER TABLE leads DROP COLUMN title;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'industry') THEN
        ALTER TABLE leads DROP COLUMN industry;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'location') THEN
        ALTER TABLE leads DROP COLUMN location;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
        ALTER TABLE leads DROP COLUMN notes;
    END IF;
END $$;

-- Rename phone_number to phone if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone_number') THEN
        ALTER TABLE leads RENAME COLUMN phone_number TO phone;
    END IF;
END $$;

-- Rename phone_number to phone in sms_messages if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sms_messages' AND column_name = 'phone_number') THEN
        ALTER TABLE sms_messages RENAME COLUMN phone_number TO phone;
    END IF;
END $$;

-- Update status values to match new schema
UPDATE leads SET status = 'Active' WHERE status = 'active';
UPDATE leads SET status = 'Inactive' WHERE status = 'inactive';
UPDATE leads SET status = 'Unsubscribed' WHERE status = 'unsubscribed';

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_leads_phone_number;
DROP INDEX IF EXISTS idx_leads_industry;
