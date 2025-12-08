-- Migration: Fix profile creation trigger
-- The trigger on_auth_user_created was only creating categories, not profiles
-- This migration updates the trigger to create both profile and categories

create or replace function public.create_default_categories()
returns trigger as $$
begin
  -- First, create the profile for the new user
  -- Use raw SQL to bypass RLS since this is a trigger running in the database context
  insert into public.profiles (id, full_name, theme_name, onboarding_complete)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'theme_name', 'forest'),
    false
  )
  on conflict (id) do nothing; -- In case profile already exists
  
  -- Then, create default categories
  insert into public.categories (user_id, name, color, type, is_default)
  values
    (new.id, 'Business', '#2563eb', 'growth', true),
    (new.id, 'Growth', '#22c55e', 'growth', true),
    (new.id, 'Product / Build', '#8b5cf6', 'delivery', true),
    (new.id, 'Operations / Admin', '#6b7280', 'admin', true),
    (new.id, 'Learning / Skill', '#4f46e5', 'personal', true),
    (new.id, 'Personal / Health', '#facc15', 'personal', true),
    (new.id, 'Routine', '#fb923c', 'necessity', true),
    (new.id, 'Waste / Distraction', '#ef4444', 'waste', true);

  return new;
end;
$$ language plpgsql security definer; -- Use security definer to bypass RLS

-- The trigger already exists, so we don't need to recreate it
-- The function update above will apply to the existing trigger

