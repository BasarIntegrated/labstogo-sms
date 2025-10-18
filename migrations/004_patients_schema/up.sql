-- Migration: 004_patients_schema
-- Description: Update schema from leads to patients for healthcare domain
-- Created: 2025-01-22
-- Author: System

-- Rename leads table to patients
ALTER TABLE leads RENAME TO patients;

-- Add new columns for patient-specific data
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS license_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_exam_date DATE,
ADD COLUMN IF NOT EXISTS next_exam_due DATE,
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(20) DEFAULT 'sms',
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;

-- Update phone column to phone_number if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'phone') THEN
        -- Copy phone data to phone_number
        UPDATE patients SET phone_number = phone WHERE phone_number IS NULL;
        -- Drop the old phone column
        ALTER TABLE patients DROP COLUMN phone;
    END IF;
END $$;

-- Update status values to match patient statuses
UPDATE patients SET status = 'active' WHERE status = 'Active';
UPDATE patients SET status = 'inactive' WHERE status = 'Inactive';
UPDATE patients SET status = 'renewal_due' WHERE status = 'Unsubscribed';

-- Add new status values
ALTER TABLE patients DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE patients ADD CONSTRAINT patients_status_check 
    CHECK (status IN ('active', 'inactive', 'renewal_due', 'expired', 'suspended'));

-- Create renewal_data table
CREATE TABLE IF NOT EXISTS renewal_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    license_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    current_expiry_date DATE NOT NULL,
    renewal_deadline DATE NOT NULL,
    renewal_status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
    exam_date DATE,
    exam_score INTEGER,
    renewal_fee DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_segments table
CREATE TABLE IF NOT EXISTS patient_segments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}',
    patient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk_operations table
CREATE TABLE IF NOT EXISTS bulk_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    patient_ids UUID[] NOT NULL,
    operation_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update foreign key references
ALTER TABLE sms_messages RENAME COLUMN lead_id TO patient_id;
ALTER TABLE job_queue RENAME COLUMN lead_id TO patient_id;

-- Update campaigns table
ALTER TABLE campaigns RENAME COLUMN total_leads TO total_patients;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_license_type ON patients(license_type);
CREATE INDEX IF NOT EXISTS idx_patients_specialty ON patients(specialty);
CREATE INDEX IF NOT EXISTS idx_patients_exam_date ON patients(last_exam_date);
CREATE INDEX IF NOT EXISTS idx_patients_renewal_date ON patients(next_exam_due);
CREATE INDEX IF NOT EXISTS idx_renewal_data_patient_id ON renewal_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_renewal_data_status ON renewal_data(renewal_status);
CREATE INDEX IF NOT EXISTS idx_renewal_data_deadline ON renewal_data(renewal_deadline);
CREATE INDEX IF NOT EXISTS idx_patient_segments_name ON patient_segments(name);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_operations(status);

-- Create updated_at triggers
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_data_updated_at 
    BEFORE UPDATE ON renewal_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_segments_updated_at 
    BEFORE UPDATE ON patient_segments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE renewal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on renewal_data" ON renewal_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on patient_segments" ON patient_segments FOR ALL USING (true);
CREATE POLICY "Allow all operations on bulk_operations" ON bulk_operations FOR ALL USING (true);

-- Update existing policies
DROP POLICY IF EXISTS "Allow all operations on leads" ON patients;
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
