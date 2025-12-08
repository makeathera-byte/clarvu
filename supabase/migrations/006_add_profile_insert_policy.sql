-- Migration: Add INSERT policy for profiles table and country/timezone columns
-- This allows new users to create their profile during signup

-- Add country and timezone columns to profiles table
alter table public.profiles
add column if not exists country text,
add column if not exists timezone text default 'UTC';

-- Add INSERT policy for profiles
create policy "Users can insert own profile"
on public.profiles for insert
with check (id = auth.uid());

