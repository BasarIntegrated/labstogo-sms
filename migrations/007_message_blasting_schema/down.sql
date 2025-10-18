-- Migration: 007_message_blasting_schema (DOWN)
-- Description: Rollback comprehensive schema for Message Blasting App
-- Created: 2025-01-22
-- Author: Autonomous Development Agent

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Standard users can manage their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view contact groups" ON contact_groups;
DROP POLICY IF EXISTS "Standard users can manage their own groups" ON contact_groups;
DROP POLICY IF EXISTS "Users can view message templates" ON message_templates;
DROP POLICY IF EXISTS "Standard users can manage their own templates" ON message_templates;
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Standard users can manage their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaign recipients" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can manage campaign recipients" ON campaign_recipients;
DROP POLICY IF EXISTS "Users can view their own uploads" ON uploads;
DROP POLICY IF EXISTS "Users can manage their own uploads" ON uploads;
DROP POLICY IF EXISTS "Users can view upload errors for their uploads" ON upload_errors;

-- Drop triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_contact_groups_updated_at ON contact_groups;
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_campaign_recipients_updated_at ON campaign_recipients;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_sessions_token;
DROP INDEX IF EXISTS idx_sessions_user_id;
DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_contacts_group_id;
DROP INDEX IF EXISTS idx_contacts_phone_number;
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_status;
DROP INDEX IF EXISTS idx_contacts_created_at;
DROP INDEX IF EXISTS idx_contact_groups_name;
DROP INDEX IF EXISTS idx_contact_groups_created_by;
DROP INDEX IF EXISTS idx_message_templates_name;
DROP INDEX IF EXISTS idx_message_templates_type;
DROP INDEX IF EXISTS idx_message_templates_created_by;
DROP INDEX IF EXISTS idx_message_templates_is_active;
DROP INDEX IF EXISTS idx_campaigns_template_id;
DROP INDEX IF EXISTS idx_campaigns_recipient_type;
DROP INDEX IF EXISTS idx_campaigns_scheduled_at;
DROP INDEX IF EXISTS idx_campaigns_status;
DROP INDEX IF EXISTS idx_campaign_recipients_campaign_id;
DROP INDEX IF EXISTS idx_campaign_recipients_contact_id;
DROP INDEX IF EXISTS idx_campaign_recipients_status;
DROP INDEX IF EXISTS idx_uploads_status;
DROP INDEX IF EXISTS idx_uploads_created_by;
DROP INDEX IF EXISTS idx_uploads_created_at;
DROP INDEX IF EXISTS idx_upload_errors_upload_id;
DROP INDEX IF EXISTS idx_upload_errors_row_number;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS upload_errors;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS campaign_recipients;
DROP TABLE IF EXISTS message_templates;
DROP TABLE IF EXISTS contact_groups;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Revert contacts table changes
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS fk_contacts_group;
ALTER TABLE contacts DROP COLUMN IF EXISTS group_id;
ALTER TABLE contacts DROP COLUMN IF EXISTS license_expiration_date;
ALTER TABLE contacts DROP COLUMN IF EXISTS others;
ALTER TABLE contacts DROP COLUMN IF EXISTS preferred_contact_method;
ALTER TABLE contacts DROP COLUMN IF EXISTS last_contact_date;

-- Revert contacts status constraint
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_status_check;
ALTER TABLE contacts ADD CONSTRAINT patients_status_check 
    CHECK (status IN ('active', 'inactive', 'renewal_due', 'expired', 'suspended'));

-- Revert campaigns table changes
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_template_id_fkey;
ALTER TABLE campaigns DROP COLUMN IF EXISTS template_id;
ALTER TABLE campaigns DROP COLUMN IF EXISTS recipient_type;
ALTER TABLE campaigns DROP COLUMN IF EXISTS recipient_groups;
ALTER TABLE campaigns DROP COLUMN IF EXISTS recipient_contacts;
ALTER TABLE campaigns DROP COLUMN IF EXISTS scheduled_at;
ALTER TABLE campaigns DROP COLUMN IF EXISTS sent_at;
ALTER TABLE campaigns DROP COLUMN IF EXISTS completed_at;

-- Revert campaign status constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
    CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'));

-- Revert sms_messages table
ALTER TABLE sms_messages DROP CONSTRAINT IF EXISTS fk_sms_messages_contact;
ALTER TABLE sms_messages RENAME COLUMN contact_id TO patient_id;
ALTER TABLE sms_messages ADD CONSTRAINT sms_messages_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- Revert job_queue table
ALTER TABLE job_queue DROP CONSTRAINT IF EXISTS fk_job_queue_contact;
ALTER TABLE job_queue RENAME COLUMN contact_id TO patient_id;
ALTER TABLE job_queue ADD CONSTRAINT job_queue_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- Rename contacts back to patients
ALTER TABLE contacts RENAME TO patients;
