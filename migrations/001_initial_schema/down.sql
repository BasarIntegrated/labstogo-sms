-- Migration: 001_initial_schema (ROLLBACK)
-- Description: Rollback initial database schema
-- Created: 2025-01-22
-- Author: System

-- Drop triggers
DROP TRIGGER IF EXISTS update_job_queue_updated_at ON job_queue;
DROP TRIGGER IF EXISTS update_sms_messages_updated_at ON sms_messages;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS job_queue;
DROP TABLE IF EXISTS sms_messages;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS leads;

-- Note: We don't drop the uuid-ossp extension as it might be used by other tables
