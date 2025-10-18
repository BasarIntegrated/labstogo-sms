-- Migration: 006_sandbox_settings (Rollback)
-- Description: Remove sandbox mode setting from SMS configuration
-- Created: 2025-01-22
-- Author: System

-- Remove sandbox mode setting
DELETE FROM system_settings 
WHERE category = 'sms' AND key = 'sandbox_mode';

-- Reset from_number to empty if it was set to sandbox number
UPDATE system_settings 
SET value = '""',
    updated_at = NOW()
WHERE category = 'sms' 
  AND key = 'from_number' 
  AND value = '"+15005550006"';
