------------------------------------------------------------
-- 10) GOALS SYSTEM
-- 7-day, 30-day, and 365-day goals with accountability
------------------------------------------------------------

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  period text not null check (period in ('7d', '30d', '365d')),
  goal_text text not null,
  
  start_date timestamptz default now(),
  end_date timestamptz not null,
  
  status text not null check (status in ('active', 'completed', 'failed')),
  
  reflection text, -- Optional reflection after completion/failure
  last_checked_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatically update updated_at
create trigger goals_updated_at
before update on public.goals
for each row execute procedure moddatetime(updated_at);

-- Ensure only ONE active goal per period per user
create unique index unique_active_goal_per_period 
on public.goals (user_id, period) 
where status = 'active';

-- RLS POLICIES
alter table public.goals enable row level security;

create policy "Users manage own goals"
on public.goals for all
using (user_id = auth.uid());
