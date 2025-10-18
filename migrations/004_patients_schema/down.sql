-- Migration: 004_patients_schema (DOWN)
-- Description: Revert schema changes from patients back to leads
-- Created: 2025-01-22
-- Author: System

-- Drop new tables
DROP TABLE IF EXISTS bulk_operations;
DROP TABLE IF EXISTS patient_segments;
DROP TABLE IF EXISTS renewal_data;

-- Revert foreign key references
ALTER TABLE sms_messages RENAME COLUMN patient_id TO lead_id;
ALTER TABLE job_queue RENAME COLUMN patient_id TO lead_id;

-- Revert campaigns table
ALTER TABLE campaigns RENAME COLUMN total_patients TO total_leads;

-- Revert patients table to leads
ALTER TABLE patients RENAME TO leads;

-- Remove patient-specific columns
ALTER TABLE leads DROP COLUMN IF EXISTS phone_number;
ALTER TABLE leads DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE leads DROP COLUMN IF EXISTS license_type;
ALTER TABLE leads DROP COLUMN IF EXISTS license_number;
ALTER TABLE leads DROP COLUMN IF EXISTS specialty;
ALTER TABLE leads DROP COLUMN IF EXISTS last_exam_date;
ALTER TABLE leads DROP COLUMN IF EXISTS next_exam_due;
ALTER TABLE leads DROP COLUMN IF EXISTS preferred_contact_method;
ALTER TABLE leads DROP COLUMN IF EXISTS last_contact_date;

-- Revert status constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS patients_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('Active', 'Inactive', 'Unsubscribed'));

-- Revert status values
UPDATE leads SET status = 'Active' WHERE status = 'active';
UPDATE leads SET status = 'Inactive' WHERE status = 'inactive';
UPDATE leads SET status = 'Unsubscribed' WHERE status = 'renewal_due';

-- Drop new indexes
DROP INDEX IF EXISTS idx_patients_phone_number;
DROP INDEX IF EXISTS idx_patients_license_type;
DROP INDEX IF EXISTS idx_patients_specialty;
DROP INDEX IF EXISTS idx_patients_exam_date;
DROP INDEX IF EXISTS idx_patients_renewal_date;
DROP INDEX IF EXISTS idx_renewal_data_patient_id;
DROP INDEX IF EXISTS idx_renewal_data_status;
DROP INDEX IF EXISTS idx_renewal_data_deadline;
DROP INDEX IF EXISTS idx_patient_segments_name;
DROP INDEX IF EXISTS idx_bulk_operations_status;

-- Revert policies
DROP POLICY IF EXISTS "Allow all operations on patients" ON leads;
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);
