-- Migration: Update default categories to new 8-category system
-- This updates the trigger function for NEW users only
-- Existing users' categories are NOT affected

------------------------------------------------------------
-- Update default category trigger function
------------------------------------------------------------

create or replace function public.create_default_categories()
returns trigger as $$
begin
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
$$ language plpgsql;

-- Note: The trigger on_auth_user_created already exists from 001_initial_schema.sql
-- This migration only updates the function body, so no trigger recreation is needed

