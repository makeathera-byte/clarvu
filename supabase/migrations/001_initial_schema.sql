-- DAYFLOW COMPLETE DATABASE SETUP
-- Build ONLY the database schema, tables, policies, and relationships.
-- No front-end logic here. This schema supports all features coming later.

------------------------------------------------------------
-- 1) USERS (Supabase Auth handles this automatically)
------------------------------------------------------------

-- Supabase creates `auth.users` automatically.
-- We create a public profile table linked to auth.users.


------------------------------------------------------------
-- 2) PROFILES TABLE
-- Stores theme, wallpapers, user color preferences, onboarding status
------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  theme_name text default 'forest',
  wallpaper_url text,
  primary_color text default '#4ade80', -- green
  accent_color text default '#22c55e',
  onboarding_complete boolean default false,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatically update updated_at
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure moddatetime(updated_at);


------------------------------------------------------------
-- 3) CATEGORY SYSTEM
-- Users can edit, delete, rename, recolor default categories.
-- Each user gets their own categories.
------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  type text check (type in ('growth','delivery','admin','personal','necessity','waste')),
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Insert default categories only for NEW users via trigger
-- (implemented later in trigger section)


------------------------------------------------------------
-- 4) TASKS TABLE
-- For scheduled, in-progress, and completed tasks
------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category_id uuid references public.categories(id) on delete set null,

  status text not null check (status in ('scheduled','in_progress','completed')),
  
  start_time timestamptz,
  end_time timestamptz,
  
  duration_minutes int,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger tasks_updated_at
before update on public.tasks
for each row execute procedure moddatetime(updated_at);


------------------------------------------------------------
-- 5) TIMER TABLE (for active real-time tasks)
-- Only one active timer per user
------------------------------------------------------------

create table if not exists public.active_timers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  ends_at timestamptz,   -- start_time + 30 minutes
  remaining_seconds int,
  is_running boolean default true,
  created_at timestamptz default now()
);


------------------------------------------------------------
-- 6) ANALYTICS EVENTS
-- Stores deep work time, summary opens, reminders, etc.
------------------------------------------------------------

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  details jsonb,
  created_at timestamptz default now()
);


------------------------------------------------------------
-- 7) GOOGLE CALENDAR INTEGRATION
------------------------------------------------------------

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  provider text not null check (provider='google_calendar'),
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  external_id text,
  title text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  source text default 'google',
  created_at timestamptz default now()
);


------------------------------------------------------------
-- 8) DEFAULT CATEGORY TRIGGER FOR NEW USERS
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_default_categories();


------------------------------------------------------------
-- 9) RLS POLICIES (SECURITY)
------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.active_timers enable row level security;
alter table public.analytics_events enable row level security;
alter table public.user_integrations enable row level security;
alter table public.calendar_events enable row level security;

-- Users can read/update only their own profile
create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid());

-- Categories
create policy "Users read own categories"
on public.categories for select
using (user_id = auth.uid());

create policy "Users modify own categories"
on public.categories for insert
with check (user_id = auth.uid());

create policy "Users update own categories"
on public.categories for update
using (user_id = auth.uid());

create policy "Users delete own categories"
on public.categories for delete
using (user_id = auth.uid());

-- Tasks
create policy "Users read own tasks"
on public.tasks for select
using (user_id = auth.uid());

create policy "Users insert own tasks"
on public.tasks for insert
with check (user_id = auth.uid());

create policy "Users update own tasks"
on public.tasks for update
using (user_id = auth.uid());

create policy "Users delete own tasks"
on public.tasks for delete
using (user_id = auth.uid());

-- Active Timers
create policy "Users read own timers"
on public.active_timers for select
using (user_id = auth.uid());

create policy "Users insert own timers"
on public.active_timers for insert
with check (user_id = auth.uid());

create policy "Users update own timers"
on public.active_timers for update
using (user_id = auth.uid());

create policy "Users delete own timers"
on public.active_timers for delete
using (user_id = auth.uid());

-- Analytics
create policy "Users manage own analytics"
on public.analytics_events for all
using (user_id = auth.uid());

-- Google integrations
create policy "Users manage own integrations"
on public.user_integrations for all
using (user_id = auth.uid());

create policy "Users manage own calendar events"
on public.calendar_events for all
using (user_id = auth.uid());

------------------------------------------------------------
-- SCHEMA COMPLETE
------------------------------------------------------------
