-- Add ai_summary_time column to user_settings table
-- Default: 22:00 (10 PM)

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_summary_time TIME DEFAULT '22:00';

-- Add comment
COMMENT ON COLUMN user_settings.ai_summary_time IS 'Time of day when daily AI summary should be generated (default: 22:00)';

