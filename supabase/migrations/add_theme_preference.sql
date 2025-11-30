-- Add theme preference column to user_settings table
-- Options: 'light', 'dark', 'system' (default: 'system')

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system'));

-- Add comment
COMMENT ON COLUMN user_settings.theme IS 'Theme preference: light, dark, or system (follows OS preference)';

-- Update existing rows to have 'system' as default if NULL
UPDATE user_settings 
SET theme = 'system'
WHERE theme IS NULL;

