-- ============================================================
-- FIX MISSING PROFILES FOR EXISTING USERS
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- This will create profiles for any users in auth.users that don't have one
-- ============================================================

-- Create profiles for users that don't have one
insert into public.profiles (id, full_name, theme_name, onboarding_complete)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce(u.raw_user_meta_data->>'theme_name', 'forest'),
  false
from auth.users u
left join public.profiles p on u.id = p.id
where p.id is null
on conflict (id) do nothing;

-- ============================================================
-- Fix Complete!
-- ============================================================
-- All users in auth.users now have corresponding profiles
-- ============================================================

