-- ============================================================
-- STANDALONE SQL: Fix All Categories
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- This will:
-- 1. Update the function for NEW users
-- 2. Clean up orphaned categories (user_id = null)
-- 3. Update EXISTING users' categories to the new 8-category system
-- ============================================================

-- Step 1: Update the function for new users
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

-- Step 2: Clean up orphaned categories (user_id = null)
delete from public.categories where user_id is null;

-- Step 3: Force reset ALL users' default categories
-- This ensures every user has exactly 8 categories with correct names/colors/types

do $$
declare
  user_record record;
  expected_categories jsonb := '[
    {"name": "Business", "color": "#2563eb", "type": "growth"},
    {"name": "Growth", "color": "#22c55e", "type": "growth"},
    {"name": "Product / Build", "color": "#8b5cf6", "type": "delivery"},
    {"name": "Operations / Admin", "color": "#6b7280", "type": "admin"},
    {"name": "Learning / Skill", "color": "#4f46e5", "type": "personal"},
    {"name": "Personal / Health", "color": "#facc15", "type": "personal"},
    {"name": "Routine", "color": "#fb923c", "type": "necessity"},
    {"name": "Waste / Distraction", "color": "#ef4444", "type": "waste"}
  ]'::jsonb;
  expected_cat jsonb;
  category_count int;
begin
  -- Loop through each user that has categories
  for user_record in 
    select distinct user_id 
    from public.categories 
    where user_id is not null
  loop
    -- Update any tasks/task_suggestions that reference default categories
    update public.tasks 
    set category_id = null 
    where user_id = user_record.user_id 
      and category_id in (
        select id from public.categories 
        where user_id = user_record.user_id and is_default = true
      );
    
    update public.task_suggestions 
    set category_id = null 
    where user_id = user_record.user_id 
      and category_id in (
        select id from public.categories 
        where user_id = user_record.user_id and is_default = true
      );
    
    -- Delete ALL default categories for this user
    delete from public.categories 
    where user_id = user_record.user_id and is_default = true;
    
    -- Create the exact 8 default categories for this user
    for expected_cat in select * from jsonb_array_elements(expected_categories)
    loop
      insert into public.categories (user_id, name, color, type, is_default)
      values (
        user_record.user_id,
        expected_cat->>'name',
        expected_cat->>'color',
        expected_cat->>'type',
        true
      );
    end loop;
  end loop;
  
  -- Also handle any users in auth.users that don't have categories yet
  for user_record in 
    select u.id as user_id
    from auth.users u
    left join public.categories c on u.id = c.user_id
    where c.id is null
  loop
    -- Create the 8 default categories for users without any
    for expected_cat in select * from jsonb_array_elements(expected_categories)
    loop
      insert into public.categories (user_id, name, color, type, is_default)
      values (
        user_record.user_id,
        expected_cat->>'name',
        expected_cat->>'color',
        expected_cat->>'type',
        true
      );
    end loop;
  end loop;
end $$;

-- ============================================================
-- Migration Complete!
-- ============================================================
-- All categories have been updated:
-- 1. New users will receive the 8 default categories
-- 2. Orphaned categories (user_id = null) have been removed
-- 3. Existing users now have the correct 8 default categories
-- 
-- IMPORTANT: After running this script:
-- 1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R) to clear cache
-- 2. Log out and log back in if categories still don't appear correctly
-- 3. The app should now show exactly 8 categories per user
-- 
-- Note: Tasks and task_suggestions that referenced old default
-- categories have had their category_id set to null. Users will
-- need to reassign categories to these items.
-- ============================================================

