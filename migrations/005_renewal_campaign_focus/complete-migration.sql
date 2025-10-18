-- Renewal-Focused Campaign Migration Script for Supabase SQL Editor
-- Copy and paste this entire script into your Supabase SQL Editor
-- This script focuses on renewal campaigns as the primary SMS functionality

-- ==============================================
-- MIGRATION: Renewal-Focused Campaign System
-- ==============================================

-- Step 1: Rename leads table to patients
ALTER TABLE leads RENAME TO patients;

-- Step 2: Add new columns for patient-specific data
ALTER TABLE patients
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN date_of_birth DATE,
ADD COLUMN license_type VARCHAR(50),
ADD COLUMN license_number VARCHAR(100),
ADD COLUMN specialty VARCHAR(100),
ADD COLUMN last_exam_date DATE,
ADD COLUMN next_exam_due DATE,
ADD COLUMN preferred_contact_method VARCHAR(20) DEFAULT 'sms',
ADD COLUMN last_contact_date TIMESTAMP WITH TIME ZONE;

-- Step 3: Add soft delete and audit columns to patients table
ALTER TABLE patients
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_by UUID,
ADD COLUMN updated_by UUID,
ADD COLUMN deleted_by UUID;

-- Step 4: Copy phone data to phone_number and drop old phone column
UPDATE patients SET phone_number = phone WHERE phone_number IS NULL;
ALTER TABLE patients DROP COLUMN phone;

-- Step 5: Update status values to match new schema
UPDATE patients SET status = 'active' WHERE status = 'Active';
UPDATE patients SET status = 'inactive' WHERE status = 'Inactive';
UPDATE patients SET status = 'renewal_due' WHERE status = 'Unsubscribed';

-- Step 6: Update status constraint
ALTER TABLE patients DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE patients ADD CONSTRAINT patients_status_check 
    CHECK (status IN ('active', 'inactive', 'renewal_due', 'expired', 'suspended'));

-- Step 7: Create renewal_data table with comprehensive timestamps
CREATE TABLE IF NOT EXISTS renewal_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    license_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    current_expiry_date DATE NOT NULL,
    renewal_deadline DATE NOT NULL,
    renewal_status VARCHAR(20) DEFAULT 'pending' CHECK (renewal_status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
    exam_date DATE,
    exam_score INTEGER,
    renewal_fee DECIMAL(10,2),
    notes TEXT,
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

-- Step 8: Create renewal_campaign_templates table
CREATE TABLE IF NOT EXISTS renewal_campaign_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('renewal_reminder', 'exam_notification')),
    message_template TEXT NOT NULL,
    license_types TEXT[] NOT NULL DEFAULT '{}',
    specialties TEXT[] NOT NULL DEFAULT '{}',
    days_before_renewal INTEGER[] NOT NULL DEFAULT '{}',
    reminder_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
    max_reminders INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    updated_by UUID,
    deleted_by UUID
);

-- Step 9: Create renewal_reminders table
CREATE TABLE IF NOT EXISTS renewal_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    renewal_data_id UUID NOT NULL REFERENCES renewal_data(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('initial', 'follow_up', 'urgent', 'final')),
    days_until_renewal INTEGER NOT NULL,
    message_content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

-- Step 10: Update campaigns table for renewal focus
ALTER TABLE campaigns 
ADD COLUMN campaign_type VARCHAR(50) DEFAULT 'renewal_reminder' CHECK (campaign_type IN ('renewal_reminder', 'exam_notification', 'general', 'custom')),
ADD COLUMN renewal_deadline_start DATE,
ADD COLUMN renewal_deadline_end DATE,
ADD COLUMN license_types TEXT[] DEFAULT '{}',
ADD COLUMN specialties TEXT[] DEFAULT '{}',
ADD COLUMN reminder_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
ADD COLUMN max_reminders INTEGER DEFAULT 3,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN updated_by UUID,
ADD COLUMN deleted_by UUID;

-- Step 11: Update foreign key references
ALTER TABLE sms_messages RENAME COLUMN lead_id TO patient_id;
ALTER TABLE job_queue RENAME COLUMN lead_id TO patient_id;

-- Step 12: Update campaigns table
ALTER TABLE campaigns RENAME COLUMN total_leads TO total_patients;

-- Step 13: Create comprehensive indexes for renewal-focused queries
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_license_type ON patients(license_type);
CREATE INDEX IF NOT EXISTS idx_patients_specialty ON patients(specialty);
CREATE INDEX IF NOT EXISTS idx_patients_exam_date ON patients(last_exam_date);
CREATE INDEX IF NOT EXISTS idx_patients_renewal_date ON patients(next_exam_due);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients(updated_at);
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON patients(deleted_at);

CREATE INDEX IF NOT EXISTS idx_renewal_data_patient_id ON renewal_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_renewal_data_status ON renewal_data(renewal_status);
CREATE INDEX IF NOT EXISTS idx_renewal_data_deadline ON renewal_data(renewal_deadline);
CREATE INDEX IF NOT EXISTS idx_renewal_data_license_type ON renewal_data(license_type);
CREATE INDEX IF NOT EXISTS idx_renewal_data_created_at ON renewal_data(created_at);
CREATE INDEX IF NOT EXISTS idx_renewal_data_updated_at ON renewal_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_renewal_data_deleted_at ON renewal_data(deleted_at);

CREATE INDEX IF NOT EXISTS idx_renewal_campaign_templates_type ON renewal_campaign_templates(campaign_type);
CREATE INDEX IF NOT EXISTS idx_renewal_campaign_templates_active ON renewal_campaign_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_renewal_campaign_templates_license_types ON renewal_campaign_templates USING GIN(license_types);
CREATE INDEX IF NOT EXISTS idx_renewal_campaign_templates_specialties ON renewal_campaign_templates USING GIN(specialties);

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_patient_id ON renewal_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_renewal_data_id ON renewal_reminders(renewal_data_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_campaign_id ON renewal_reminders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_status ON renewal_reminders(status);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_scheduled_at ON renewal_reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_renewal_reminders_type ON renewal_reminders(reminder_type);

CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_renewal_deadline_start ON campaigns(renewal_deadline_start);
CREATE INDEX IF NOT EXISTS idx_campaigns_renewal_deadline_end ON campaigns(renewal_deadline_end);
CREATE INDEX IF NOT EXISTS idx_campaigns_license_types ON campaigns USING GIN(license_types);
CREATE INDEX IF NOT EXISTS idx_campaigns_specialties ON campaigns USING GIN(specialties);

-- Step 14: Create comprehensive updated_at triggers for all tables
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_data_updated_at 
    BEFORE UPDATE ON renewal_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_campaign_templates_updated_at 
    BEFORE UPDATE ON renewal_campaign_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_reminders_updated_at 
    BEFORE UPDATE ON renewal_reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_messages_updated_at 
    BEFORE UPDATE ON sms_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_queue_updated_at 
    BEFORE UPDATE ON job_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 15: Create renewal-focused functions
CREATE OR REPLACE FUNCTION get_patients_due_for_renewal(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    patient_id UUID,
    patient_name TEXT,
    phone_number VARCHAR(20),
    license_type VARCHAR(50),
    license_number VARCHAR(100),
    specialty VARCHAR(100),
    renewal_deadline DATE,
    days_until_renewal INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.phone_number,
        rd.license_type,
        rd.license_number,
        p.specialty,
        rd.renewal_deadline,
        rd.renewal_deadline - CURRENT_DATE as days_until_renewal
    FROM patients p
    JOIN renewal_data rd ON p.id = rd.patient_id
    WHERE p.deleted_at IS NULL
    AND rd.deleted_at IS NULL
    AND rd.renewal_status = 'pending'
    AND rd.renewal_deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * days_ahead
    ORDER BY rd.renewal_deadline ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_renewal_campaign(
    campaign_name VARCHAR(255),
    message_template TEXT,
    days_ahead INTEGER DEFAULT 30,
    license_types_filter TEXT[] DEFAULT NULL,
    specialties_filter TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    campaign_id UUID;
    patient_count INTEGER;
BEGIN
    -- Create the campaign
    INSERT INTO campaigns (
        name, 
        message_template, 
        campaign_type,
        renewal_deadline_start,
        renewal_deadline_end,
        license_types,
        specialties,
        status,
        created_by
    ) VALUES (
        campaign_name,
        message_template,
        'renewal_reminder',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 day' * days_ahead,
        COALESCE(license_types_filter, ARRAY[]::TEXT[]),
        COALESCE(specialties_filter, ARRAY[]::TEXT[]),
        'draft',
        '00000000-0000-0000-0000-000000000000' -- System user
    ) RETURNING id INTO campaign_id;
    
    -- Count eligible patients
    SELECT COUNT(*) INTO patient_count
    FROM get_patients_due_for_renewal(days_ahead) gpr
    WHERE (license_types_filter IS NULL OR gpr.license_type = ANY(license_types_filter))
    AND (specialties_filter IS NULL OR gpr.specialty = ANY(specialties_filter));
    
    -- Update campaign with patient count
    UPDATE campaigns 
    SET total_patients = patient_count
    WHERE id = campaign_id;
    
    RETURN campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION schedule_renewal_reminders(
    campaign_id UUID,
    template_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    reminder_count INTEGER := 0;
    template_record RECORD;
    patient_record RECORD;
BEGIN
    -- Get template details
    SELECT * INTO template_record
    FROM renewal_campaign_templates
    WHERE id = template_id AND is_active = true AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found or inactive';
    END IF;
    
    -- Get campaign details
    SELECT * INTO patient_record
    FROM campaigns
    WHERE id = campaign_id AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Campaign not found';
    END IF;
    
    -- Schedule reminders for eligible patients
    INSERT INTO renewal_reminders (
        patient_id,
        renewal_data_id,
        campaign_id,
        reminder_type,
        days_until_renewal,
        message_content,
        scheduled_at,
        created_by
    )
    SELECT 
        gpr.patient_id,
        rd.id as renewal_data_id,
        campaign_id,
        CASE 
            WHEN gpr.days_until_renewal <= 7 THEN 'urgent'
            WHEN gpr.days_until_renewal <= 30 THEN 'follow_up'
            ELSE 'initial'
        END as reminder_type,
        gpr.days_until_renewal,
        template_record.message_template as message_content,
        CURRENT_TIMESTAMP + INTERVAL '1 hour' as scheduled_at,
        '00000000-0000-0000-0000-000000000000' -- System user
    FROM get_patients_due_for_renewal(90) gpr
    JOIN renewal_data rd ON gpr.patient_id = rd.patient_id
    WHERE (template_record.license_types = '{}' OR gpr.license_type = ANY(template_record.license_types))
    AND (template_record.specialties = '{}' OR gpr.specialty = ANY(template_record.specialties))
    AND gpr.days_until_renewal = ANY(template_record.days_before_renewal);
    
    GET DIAGNOSTICS reminder_count = ROW_COUNT;
    
    RETURN reminder_count;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

-- Step 17: Create RLS policies for all tables
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on renewal_data" ON renewal_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on renewal_campaign_templates" ON renewal_campaign_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations on renewal_reminders" ON renewal_reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations on campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all operations on sms_messages" ON sms_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on job_queue" ON job_queue FOR ALL USING (true);

-- Step 18: Insert default renewal campaign templates
INSERT INTO renewal_campaign_templates (
    name, 
    description, 
    campaign_type, 
    message_template, 
    license_types, 
    specialties, 
    days_before_renewal, 
    reminder_frequency, 
    max_reminders,
    created_by
) VALUES 
-- Medical License Renewal Template
(
    'Medical License Renewal Reminder',
    'Standard reminder for medical license renewals',
    'renewal_reminder',
    'Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.',
    ARRAY['Medical'],
    ARRAY[]::TEXT[],
    ARRAY[90, 60, 30, 14, 7],
    'weekly',
    5,
    '00000000-0000-0000-0000-000000000000'
),
-- Nursing License Renewal Template
(
    'Nursing License Renewal Reminder',
    'Standard reminder for nursing license renewals',
    'renewal_reminder',
    'Hello {{first_name}}, your nursing license ({{license_number}}) renewal is due on {{renewal_deadline}}. Don''t let your license expire! Reply STOP to opt out.',
    ARRAY['Nursing'],
    ARRAY[]::TEXT[],
    ARRAY[90, 60, 30, 14, 7],
    'weekly',
    5,
    '00000000-0000-0000-0000-000000000000'
),
-- Pharmacy License Renewal Template
(
    'Pharmacy License Renewal Reminder',
    'Standard reminder for pharmacy license renewals',
    'renewal_reminder',
    '{{first_name}}, your pharmacy license ({{license_number}}) expires {{renewal_deadline}}. Renew now to maintain your practice. Reply STOP to opt out.',
    ARRAY['Pharmacy'],
    ARRAY[]::TEXT[],
    ARRAY[90, 60, 30, 14, 7],
    'weekly',
    5,
    '00000000-0000-0000-0000-000000000000'
),
-- Urgent Renewal Template
(
    'Urgent License Renewal',
    'Urgent reminder for licenses expiring soon',
    'renewal_reminder',
    'URGENT: {{first_name}}, your {{license_type}} license ({{license_number}}) expires in {{days_until_renewal}} days on {{renewal_deadline}}. Renew immediately! Reply STOP to opt out.',
    ARRAY['Medical', 'Nursing', 'Pharmacy', 'Dental'],
    ARRAY[]::TEXT[],
    ARRAY[7, 3, 1],
    'daily',
    3,
    '00000000-0000-0000-0000-000000000000'
);

-- Step 19: Create views for renewal-focused queries
CREATE OR REPLACE VIEW active_patients AS
SELECT * FROM patients WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_renewal_data AS
SELECT * FROM renewal_data WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_renewal_campaign_templates AS
SELECT * FROM renewal_campaign_templates WHERE deleted_at IS NULL AND is_active = true;

CREATE OR REPLACE VIEW active_renewal_reminders AS
SELECT * FROM renewal_reminders WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW patients_due_for_renewal AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone_number,
    p.email,
    p.license_type,
    p.specialty,
    rd.license_number,
    rd.renewal_deadline,
    rd.renewal_status,
    rd.renewal_deadline - CURRENT_DATE as days_until_renewal
FROM patients p
JOIN renewal_data rd ON p.id = rd.patient_id
WHERE p.deleted_at IS NULL
AND rd.deleted_at IS NULL
AND rd.renewal_status = 'pending'
ORDER BY rd.renewal_deadline ASC;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify renewal-focused table structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'renewal_data', 'renewal_campaign_templates', 'renewal_reminders', 'campaigns');

-- Check renewal campaign templates
SELECT name, campaign_type, license_types, days_before_renewal 
FROM renewal_campaign_templates 
WHERE is_active = true;

-- Test renewal functions
SELECT * FROM get_patients_due_for_renewal(30) LIMIT 5;
