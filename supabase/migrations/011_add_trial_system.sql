-- Add trial system to profiles
-- All new signups automatically get a 14-day trial

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.trial_end IS '14-day trial end date, automatically set on signup. NULL means no trial or trial expired.';

-- Create index for trial queries
CREATE INDEX IF NOT EXISTS profiles_trial_end_idx ON profiles(trial_end);
