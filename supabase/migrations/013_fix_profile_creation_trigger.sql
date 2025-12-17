-- Migration: Fix profile creation trigger to ensure reliable profile creation
-- This replaces the existing trigger with a proper implementation that handles
-- both email and Google OAuth signups reliably
--
-- Based on CLARVU requirements: Profiles must be created ONLY via database trigger.
-- Frontend should only READ or UPDATE profiles.

-- Add email column to profiles table if it doesn't exist
alter table public.profiles
add column if not exists email text;

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_provider text;
  user_full_name text;
  user_avatar_url text;
begin
  -- Determine provider from app_metadata
  -- For Google OAuth, Supabase sets raw_app_meta_data->>'provider' to 'google'
  -- For email signups, it may be null or 'email'
  user_provider := coalesce(
    new.raw_app_meta_data->>'provider',
    'email'
  );
  
  -- Extract full name from metadata (Google OAuth uses 'full_name' or 'name')
  user_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1), -- Fallback to email username
    ''
  );
  
  -- Extract avatar URL (Google OAuth uses 'avatar_url' or 'picture')
  user_avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  -- Insert profile with all required fields
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    provider,
    theme_name,
    onboarding_complete,
    trial_end,
    created_at
  )
  values (
    new.id,
    new.email,
    user_full_name,
    user_avatar_url,
    user_provider,
    coalesce(new.raw_user_meta_data->>'theme_name', 'forest'),
    false,
    now() + interval '14 days', -- 14-day trial
    now()
  )
  on conflict (id) do nothing; -- Prevent errors if profile already exists

  return new;
exception
  when others then
    -- Log error but don't fail the user creation
    -- This allows user to be created even if profile creation fails
    raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Drop existing trigger if any
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Also create default categories in a separate function/trigger
-- We'll keep the create_default_categories function for categories
-- but update it to not create profiles (since handle_new_user does that)
create or replace function public.create_default_categories()
returns trigger as $$
begin
  -- Only create categories, profile is already created by handle_new_user
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
$$ language plpgsql security definer;

-- Create a second trigger for categories (runs after profile creation)
drop trigger if exists on_auth_user_created_categories on auth.users;

create trigger on_auth_user_created_categories
after insert on auth.users
for each row
execute procedure public.create_default_categories();

