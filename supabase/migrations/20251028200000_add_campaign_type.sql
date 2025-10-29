-- Add campaign_type column to campaigns table

-- Add campaign_type column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) DEFAULT 'general' 
CHECK (campaign_type IN ('general', 'appointment_reminder', 'custom', 'email', 'renewal_reminder', 'exam_notification'));

-- Update existing campaigns to have 'general' as the default type if they don't have a type
UPDATE campaigns SET campaign_type = 'general' WHERE campaign_type IS NULL;

