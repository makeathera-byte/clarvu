-- Migration: Fix RLS policies to allow trigger inserts
-- Ensure RLS is enabled and policies allow trigger inserts

alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can read their profile" on profiles;
drop policy if exists "Users can update their profile" on profiles;
drop policy if exists "Users can insert their profile" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

-- Create new policies
create policy "Users can read their profile"
on profiles
for select
using (auth.uid() = id);

create policy "Users can update their profile"
on profiles
for update
using (auth.uid() = id);

create policy "Users can insert their profile"
on profiles
for insert
with check (auth.uid() = id);

-- Note: The trigger uses security definer, so it can insert profiles
-- even if RLS would normally block it. The policy above is for
-- client-side operations, but the trigger bypasses RLS.
