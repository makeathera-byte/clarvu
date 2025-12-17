-- Run this in Supabase SQL Editor
-- This fixes the trigger setup with proper CASCADE handling

-- Step 1: Drop the existing trigger and function with CASCADE
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.create_default_categories() CASCADE;

-- Step 2: Create the updated function with trial support
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with 14-day trial
  INSERT INTO public.profiles (id, full_name, theme_name, onboarding_complete, trial_end)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'theme_name', 'forest'),
    false,
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default categories
  INSERT INTO public.categories (user_id, name, color, type, is_default)
  VALUES
    (NEW.id, 'Business', '#2563eb', 'growth', true),
    (NEW.id, 'Growth', '#22c55e', 'growth', true),
    (NEW.id, 'Product / Build', '#8b5cf6', 'delivery', true),
    (NEW.id, 'Operations / Admin', '#6b7280', 'admin', true),
    (NEW.id, 'Learning / Skill', '#4f46e5', 'personal', true),
    (NEW.id, 'Personal / Health', '#facc15', 'personal', true),
    (NEW.id, 'Routine', '#fb923c', 'necessity', true),
    (NEW.id, 'Waste / Distraction', '#ef4444', 'waste', true)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories();

-- Verify it worked
SELECT 'Trigger setup complete!' as status;
