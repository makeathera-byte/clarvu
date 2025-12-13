-- ============================================================
-- STANDALONE SQL: Add Google OAuth Fields to Profiles
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- This will:
-- 1. Add avatar_url column to profiles table
-- 2. Add provider column to profiles table
-- 3. Update the profile creation trigger to handle Google OAuth metadata
-- ============================================================

-- Migration: Add Google OAuth fields to profiles table
-- This migration adds avatar_url and provider fields to support Google OAuth

-- Add avatar_url column to profiles table
alter table public.profiles
add column if not exists avatar_url text;

-- Add provider column to profiles table
-- This tracks the authentication provider (email, google, etc.)
alter table public.profiles
add column if not exists provider text default 'email';

-- Update the profile creation trigger to handle Google OAuth metadata
create or replace function public.create_default_categories()
returns trigger as $$
begin
  -- First, create the profile for the new user
  -- Use on conflict to handle cases where profile might already exist
  -- Note: Provider will be set by application code via profileSync, defaulting to 'email' here
  insert into public.profiles (
    id, 
    full_name, 
    theme_name, 
    onboarding_complete,
    avatar_url,
    provider,
    country,
    timezone
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(new.raw_user_meta_data->>'theme_name', 'forest'),
    false,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      null
    ),
    'email', -- Default to email, will be updated by application code if OAuth
    coalesce(new.raw_user_meta_data->>'country', null),
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  )
  on conflict (id) do update
  set
    full_name = coalesce(
      profiles.full_name,
      excluded.full_name,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
    ),
    avatar_url = coalesce(
      profiles.avatar_url,
      excluded.avatar_url,
      coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
    ),
    -- Keep existing provider (don't overwrite with default 'email')
    provider = profiles.provider,
    country = coalesce(profiles.country, excluded.country),
    timezone = coalesce(profiles.timezone, excluded.timezone);
  
  -- Then, create default categories only if they don't exist
  insert into public.categories (user_id, name, color, type, is_default)
  select
    new.id, name, color, type, true
  from (values
    ('Business', '#2563eb', 'growth'),
    ('Growth', '#22c55e', 'growth'),
    ('Product / Build', '#8b5cf6', 'delivery'),
    ('Operations / Admin', '#6b7280', 'admin'),
    ('Learning / Skill', '#4f46e5', 'personal'),
    ('Personal / Health', '#facc15', 'personal'),
    ('Routine', '#fb923c', 'necessity'),
    ('Waste / Distraction', '#ef4444', 'waste')
  ) as default_cats(name, color, type)
  where not exists (
    select 1 from public.categories 
    where user_id = new.id and is_default = true
  );

  return new;
end;
$$ language plpgsql security definer; -- Use security definer to bypass RLS

-- ============================================================
-- Migration Complete!
-- ============================================================
-- The profiles table now has:
-- - avatar_url column for user avatars
-- - provider column to track authentication method
-- - Updated trigger function to handle Google OAuth metadata
-- ============================================================

