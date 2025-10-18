-- Migration: 002_settings_schema
-- Description: Add system settings table
-- Created: 2025-01-22
-- Author: System

-- Settings table for system configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'sms', 'email', 'general', 'notifications', 'security'
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create updated_at trigger
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all operations for now - restrict based on your auth needs)
CREATE POLICY "Allow all operations on system_settings" ON system_settings FOR ALL USING (true);

-- Insert default settings
INSERT INTO system_settings (category, key, value, description) VALUES
-- SMS Settings
('sms', 'provider', '"twilio"', 'SMS provider to use'),
('sms', 'rate_limit', '100', 'Maximum messages per minute'),
('sms', 'retry_attempts', '3', 'Number of retry attempts for failed messages'),
('sms', 'from_number', '""', 'Default from phone number'),

-- Email Settings
('email', 'provider', '"smtp"', 'Email provider to use'),
('email', 'smtp_port', '587', 'SMTP port number'),
('email', 'from_email', '""', 'Default from email address'),

-- General Settings
('general', 'app_name', '"LabsToGo SMS Blaster"', 'Application name'),
('general', 'timezone', '"America/New_York"', 'Default timezone'),
('general', 'date_format', '"MM/DD/YYYY"', 'Default date format'),
('general', 'language', '"en"', 'Default language'),

-- Notification Settings
('notifications', 'email_notifications', 'true', 'Enable email notifications'),
('notifications', 'sms_notifications', 'false', 'Enable SMS notifications'),
('notifications', 'campaign_alerts', 'true', 'Enable campaign completion alerts'),
('notifications', 'error_alerts', 'true', 'Enable error alerts'),

-- Security Settings
('security', 'session_timeout', '30', 'Session timeout in minutes'),
('security', 'require_two_factor', 'false', 'Require two-factor authentication'),
('security', 'max_login_attempts', '5', 'Maximum login attempts before lockout'),
('security', 'allowed_domains', '[]', 'List of allowed email domains')

ON CONFLICT (category, key) DO NOTHING;
