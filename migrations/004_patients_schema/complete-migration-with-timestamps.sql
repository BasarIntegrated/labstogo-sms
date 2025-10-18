-- Complete Migration Script for Supabase SQL Editor
-- Copy and paste this entire script into your Supabase SQL Editor
-- This script ensures comprehensive timestamp coverage for all table models

-- ==============================================
-- MIGRATION: Leads to Patients Schema Update
-- With Comprehensive Timestamp Coverage
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

-- Step 8: Create patient_segments table with comprehensive timestamps
CREATE TABLE IF NOT EXISTS patient_segments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}',
    patient_count INTEGER DEFAULT 0,
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

-- Step 9: Create bulk_operations table with comprehensive timestamps
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    patient_ids UUID[] NOT NULL,
    operation_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    -- Comprehensive timestamp coverage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID
);

-- Step 10: Update existing tables to add comprehensive timestamps

-- Update campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Update sms_messages table
ALTER TABLE sms_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Update job_queue table
ALTER TABLE job_queue 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Update system_settings table
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Step 11: Update foreign key references
ALTER TABLE sms_messages RENAME COLUMN lead_id TO patient_id;
ALTER TABLE job_queue RENAME COLUMN lead_id TO patient_id;

-- Step 12: Update campaigns table
ALTER TABLE campaigns RENAME COLUMN total_leads TO total_patients;

-- Step 13: Create comprehensive indexes for better performance
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
CREATE INDEX IF NOT EXISTS idx_renewal_data_created_at ON renewal_data(created_at);
CREATE INDEX IF NOT EXISTS idx_renewal_data_updated_at ON renewal_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_renewal_data_deleted_at ON renewal_data(deleted_at);

CREATE INDEX IF NOT EXISTS idx_patient_segments_name ON patient_segments(name);
CREATE INDEX IF NOT EXISTS idx_patient_segments_created_at ON patient_segments(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_segments_updated_at ON patient_segments(updated_at);
CREATE INDEX IF NOT EXISTS idx_patient_segments_deleted_at ON patient_segments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_created_at ON bulk_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_updated_at ON bulk_operations(updated_at);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_deleted_at ON bulk_operations(deleted_at);

-- Step 14: Create comprehensive updated_at triggers for all tables
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_data_updated_at 
    BEFORE UPDATE ON renewal_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_segments_updated_at 
    BEFORE UPDATE ON patient_segments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_operations_updated_at 
    BEFORE UPDATE ON bulk_operations 
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

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 15: Create soft delete functions
CREATE OR REPLACE FUNCTION soft_delete_patient(patient_id UUID, deleted_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE patients 
    SET deleted_at = NOW(), deleted_by = deleted_by_user, updated_at = NOW()
    WHERE id = patient_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_renewal_data(renewal_id UUID, deleted_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE renewal_data 
    SET deleted_at = NOW(), deleted_by = deleted_by_user, updated_at = NOW()
    WHERE id = renewal_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_patient_segment(segment_id UUID, deleted_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE patient_segments 
    SET deleted_at = NOW(), deleted_by = deleted_by_user, updated_at = NOW()
    WHERE id = segment_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_bulk_operation(operation_id UUID, deleted_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE bulk_operations 
    SET deleted_at = NOW(), deleted_by = deleted_by_user, updated_at = NOW()
    WHERE id = operation_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Create restore functions
CREATE OR REPLACE FUNCTION restore_patient(patient_id UUID, restored_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE patients 
    SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
    WHERE id = patient_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_renewal_data(renewal_id UUID, restored_by_user UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE renewal_data 
    SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
    WHERE id = renewal_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Step 17: Create audit log table for tracking all changes
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'RESTORE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);

-- Step 18: Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Step 19: Create RLS policies for all tables
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on renewal_data" ON renewal_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_segments" ON patient_segments FOR ALL USING (true);
CREATE POLICY "Allow all operations on bulk_operations" ON bulk_operations FOR ALL USING (true);
CREATE POLICY "Allow all operations on audit_log" ON audit_log FOR ALL USING (true);

-- Step 20: Create views for active records (excluding soft deleted)
CREATE OR REPLACE VIEW active_patients AS
SELECT * FROM patients WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_renewal_data AS
SELECT * FROM renewal_data WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_patient_segments AS
SELECT * FROM patient_segments WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_bulk_operations AS
SELECT * FROM bulk_operations WHERE deleted_at IS NULL;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify patients table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'renewal_data', 'patient_segments', 'bulk_operations', 'audit_log');

-- Check timestamp columns in all tables
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name IN ('created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by')
ORDER BY table_name, column_name;

-- Check sample data
SELECT * FROM patients LIMIT 1;
