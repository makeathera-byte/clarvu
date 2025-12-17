-- Add onboarding_complete column to track if user has completed onboarding

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.onboarding_complete IS 'Whether user has completed the onboarding flow (country & theme selection)';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON public.profiles(onboarding_complete);
