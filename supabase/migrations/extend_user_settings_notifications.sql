-- Extend user_settings table with notification settings for MARK 10

-- Add notification-related columns
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS smart_reminders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS min_reminder_interval_minutes INTEGER DEFAULT 15 CHECK (min_reminder_interval_minutes >= 5 AND min_reminder_interval_minutes <= 60),
ADD COLUMN IF NOT EXISTS max_reminder_interval_minutes INTEGER DEFAULT 60 CHECK (max_reminder_interval_minutes >= 15 AND max_reminder_interval_minutes <= 120),
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS reminder_mode TEXT DEFAULT 'medium' CHECK (reminder_mode IN ('low', 'medium', 'high'));

-- Update existing rows to have default values
UPDATE user_settings 
SET 
  notifications_enabled = COALESCE(notifications_enabled, true),
  smart_reminders_enabled = COALESCE(smart_reminders_enabled, true),
  min_reminder_interval_minutes = COALESCE(min_reminder_interval_minutes, 15),
  max_reminder_interval_minutes = COALESCE(max_reminder_interval_minutes, 60),
  reminder_mode = COALESCE(reminder_mode, 'medium')
WHERE notifications_enabled IS NULL 
   OR smart_reminders_enabled IS NULL
   OR min_reminder_interval_minutes IS NULL
   OR max_reminder_interval_minutes IS NULL
   OR reminder_mode IS NULL;

-- Set default reminder_mode based on existing reminder_interval
UPDATE user_settings
SET reminder_mode = CASE
  WHEN reminder_interval = 15 THEN 'high'
  WHEN reminder_interval = 30 THEN 'medium'
  WHEN reminder_interval = 60 THEN 'low'
  ELSE 'medium'
END
WHERE reminder_mode IS NULL OR reminder_mode = 'medium';

-- Map reminder_mode to min/max intervals
UPDATE user_settings
SET 
  min_reminder_interval_minutes = CASE reminder_mode
    WHEN 'low' THEN 30
    WHEN 'medium' THEN 20
    WHEN 'high' THEN 15
    ELSE 20
  END,
  max_reminder_interval_minutes = CASE reminder_mode
    WHEN 'low' THEN 60
    WHEN 'medium' THEN 45
    WHEN 'high' THEN 30
    ELSE 45
  END
WHERE min_reminder_interval_minutes IS NULL OR max_reminder_interval_minutes IS NULL;

