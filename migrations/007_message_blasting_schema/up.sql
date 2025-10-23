-- Migration: 007_message_blasting_schema
-- Description: Create comprehensive schema for Message Blasting App
-- Created: 2025-01-22
-- Author: Autonomous Development Agent

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'standard' CHECK (role IN ('admin', 'standard')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rename patients table to contacts for general use
ALTER TABLE patients RENAME TO contacts;

-- Update contacts table to be more general (not healthcare-specific)
ALTER TABLE contacts 
    DROP COLUMN IF EXISTS license_type,
    DROP COLUMN IF EXISTS license_number,
    DROP COLUMN IF EXISTS specialty,
    DROP COLUMN IF EXISTS last_exam_date,
    DROP COLUMN IF EXISTS next_exam_due,
    DROP COLUMN IF EXISTS preferred_contact_method,
    DROP COLUMN IF EXISTS last_contact_date,
    DROP COLUMN IF EXISTS date_of_birth;

-- Add general contact fields
ALTER TABLE contacts
    ADD COLUMN IF NOT EXISTS group_id UUID,
    ADD COLUMN IF NOT EXISTS license_expiration_date DATE,
    ADD COLUMN IF NOT EXISTS others TEXT,
    ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) DEFAULT 'sms',
    ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;

-- Update status values to be more general
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS patients_status_check;
ALTER TABLE contacts ADD CONSTRAINT contacts_status_check 
    CHECK (status IN ('active', 'inactive', 'unsubscribed', 'bounced', 'pending'));

-- Create contact_groups table
CREATE TABLE IF NOT EXISTS contact_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    contact_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for group_id in contacts
ALTER TABLE contacts 
    ADD CONSTRAINT fk_contacts_group 
    FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE SET NULL;

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'sms' CHECK (type IN ('sms', 'email')),
    character_count INTEGER DEFAULT 0,
    parts_estimate INTEGER DEFAULT 1,
    merge_tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update campaigns table for message blasting
ALTER TABLE campaigns 
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES message_templates(id),
    ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'all' CHECK (recipient_type IN ('all', 'groups', 'custom')),
    ADD COLUMN IF NOT EXISTS recipient_groups UUID[],
    ADD COLUMN IF NOT EXISTS recipient_contacts UUID[],
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update campaign status constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
    CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled', 'paused'));

-- Create campaign_recipients table for tracking individual recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    provider_message_id VARCHAR(255),
    provider_response JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- Create uploads table for tracking file uploads
CREATE TABLE IF NOT EXISTS uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_summary JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create upload_errors table for detailed error tracking
CREATE TABLE IF NOT EXISTS upload_errors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    field_name VARCHAR(100),
    field_value TEXT,
    error_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update sms_messages table to reference contacts instead of patients
ALTER TABLE sms_messages RENAME COLUMN patient_id TO contact_id;
ALTER TABLE sms_messages DROP CONSTRAINT IF EXISTS sms_messages_lead_id_fkey;
ALTER TABLE sms_messages DROP CONSTRAINT IF EXISTS sms_messages_patient_id_fkey;
ALTER TABLE sms_messages ADD CONSTRAINT fk_sms_messages_contact 
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;

-- Update job_queue table to reference contacts instead of patients
ALTER TABLE job_queue RENAME COLUMN patient_id TO contact_id;
ALTER TABLE job_queue DROP CONSTRAINT IF EXISTS job_queue_lead_id_fkey;
ALTER TABLE job_queue DROP CONSTRAINT IF EXISTS job_queue_patient_id_fkey;
ALTER TABLE job_queue ADD CONSTRAINT fk_job_queue_contact 
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_contacts_group_id ON contacts(group_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

CREATE INDEX IF NOT EXISTS idx_contact_groups_name ON contact_groups(name);
CREATE INDEX IF NOT EXISTS idx_contact_groups_created_by ON contact_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_message_templates_name ON message_templates(name);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);
CREATE INDEX IF NOT EXISTS idx_message_templates_created_by ON message_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_template_id ON campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_recipient_type ON campaigns(recipient_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);

CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_created_by ON uploads(created_by);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);

CREATE INDEX IF NOT EXISTS idx_upload_errors_upload_id ON upload_errors(upload_id);
CREATE INDEX IF NOT EXISTS idx_upload_errors_row_number ON upload_errors(row_number);

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_groups_updated_at 
    BEFORE UPDATE ON contact_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_recipients_updated_at 
    BEFORE UPDATE ON campaign_recipients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_errors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Standard users can manage their own contacts" ON contacts FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view contact groups" ON contact_groups FOR SELECT USING (true);
CREATE POLICY "Standard users can manage their own groups" ON contact_groups FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view message templates" ON message_templates FOR SELECT USING (true);
CREATE POLICY "Standard users can manage their own templates" ON message_templates FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Standard users can manage their own campaigns" ON campaigns FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view campaign recipients" ON campaign_recipients FOR SELECT USING (true);
CREATE POLICY "Users can manage campaign recipients" ON campaign_recipients FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view their own uploads" ON uploads FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can manage their own uploads" ON uploads FOR ALL USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view upload errors for their uploads" ON upload_errors FOR SELECT USING (
    EXISTS (SELECT 1 FROM uploads WHERE id = upload_id AND created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES (
    'admin@labstogo.info', 
    crypt('admin123', gen_salt('bf')), 
    'Admin', 
    'User', 
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert default contact group
INSERT INTO contact_groups (name, description, created_by) 
VALUES (
    'Default Group', 
    'Default group for all contacts', 
    (SELECT id FROM users WHERE email = 'admin@labstogo.info' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Insert default message template
INSERT INTO message_templates (name, description, content, merge_tags, created_by) 
VALUES (
    'Welcome Message', 
    'Default welcome message template', 
    'Hello {{first_name}}, welcome to our service! Your phone number is {{phone_number}} and email is {{email}}.',
    ARRAY['first_name', 'last_name', 'phone_number', 'email', 'group', 'license_expiration_date'],
    (SELECT id FROM users WHERE email = 'admin@labstogo.info' LIMIT 1)
) ON CONFLICT DO NOTHING;
