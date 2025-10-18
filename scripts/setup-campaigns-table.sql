-- Complete Campaigns Table Setup for LabsToGo SMS
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create campaigns table with all required columns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    message_template TEXT NOT NULL,
    campaign_type VARCHAR(50) DEFAULT 'renewal_reminder' CHECK (campaign_type IN ('renewal_reminder', 'exam_notification', 'general', 'custom')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    filters JSONB DEFAULT '{}',
    renewal_deadline_start DATE,
    renewal_deadline_end DATE,
    license_types TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    reminder_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
    max_reminders INTEGER DEFAULT 3,
    total_patients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial campaign
INSERT INTO campaigns (
    name,
    description,
    message_template,
    campaign_type,
    status,
    license_types,
    specialties,
    reminder_frequency,
    max_reminders,
    total_patients,
    sent_count,
    delivered_count,
    failed_count,
    created_by
) VALUES (
    'Medical License Renewal',
    'Standard reminder for medical license renewals',
    'Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.',
    'renewal_reminder',
    'draft',
    ARRAY['Medical'],
    ARRAY[]::text[],
    'weekly',
    5,
    0,
    0,
    0,
    0,
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT DO NOTHING;

-- Insert second campaign
INSERT INTO campaigns (
    name,
    description,
    message_template,
    campaign_type,
    status,
    license_types,
    specialties,
    reminder_frequency,
    max_reminders,
    total_patients,
    sent_count,
    delivered_count,
    failed_count,
    created_by
) VALUES (
    'Urgent License Renewal',
    'Urgent reminder for licenses expiring soon',
    'URGENT: {{first_name}}, your {{license_type}} license ({{license_number}}) expires in {{days_until_renewal}} days on {{renewal_deadline}}. Renew immediately! Reply STOP to opt out.',
    'renewal_reminder',
    'draft',
    ARRAY['Medical', 'Nursing', 'Pharmacy', 'Dental'],
    ARRAY[]::text[],
    'daily',
    3,
    0,
    0,
    0,
    0,
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
    id,
    name,
    status,
    campaign_type,
    message_template,
    created_at
FROM campaigns 
ORDER BY created_at;
