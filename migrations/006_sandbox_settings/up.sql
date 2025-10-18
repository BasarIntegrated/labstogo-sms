-- Migration: 006_sandbox_settings
-- Description: Add sandbox mode setting to SMS configuration
-- Created: 2025-01-22
-- Author: System

-- Add sandbox mode setting to SMS configuration
INSERT INTO system_settings (category, key, value, description) VALUES
('sms', 'sandbox_mode', 'false', 'Enable sandbox mode for free SMS testing (only verified numbers)')
ON CONFLICT (category, key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update existing from_number setting to handle sandbox mode
UPDATE system_settings 
SET value = CASE 
  WHEN key = 'from_number' AND value = '""' THEN 
    CASE 
      WHEN (SELECT value::boolean FROM system_settings WHERE category = 'sms' AND key = 'sandbox_mode') = true 
      THEN '"+15005550006"'
      ELSE value
    END
  ELSE value
END,
updated_at = NOW()
WHERE category = 'sms' AND key = 'from_number';
