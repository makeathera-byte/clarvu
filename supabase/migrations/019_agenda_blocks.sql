------------------------------------------------------------
-- AGENDA BLOCKS TABLE
-- High-level planning blocks for the Intent Calendar
-- Examples: "Deep Work", "Sales Outreach", "Strategy"
------------------------------------------------------------


create table if not exists public.agenda_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  title text not null,
  description text,

-- Date range (not exact hours)
start_date date not null, end_date date not null,

-- Flexible time blocks (soft scheduling)
time_of_day text check (
    time_of_day in (
        'morning',
        'afternoon',
        'evening',
        'all_day'
    )
),

-- Visual customization
color text default '#6b7280',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatically update updated_at
create trigger agenda_blocks_updated_at
before update on public.agenda_blocks
for each row execute procedure moddatetime(updated_at);

-- RLS POLICIES
alter table public.agenda_blocks enable row level security;

create policy "Users manage own agenda blocks" on public.agenda_blocks for all using (user_id = auth.uid ());

-- INDEXES for efficient querying
create index idx_agenda_blocks_user_dates on public.agenda_blocks (user_id, start_date, end_date);

create index idx_agenda_blocks_user_time on public.agenda_blocks (user_id, time_of_day)
where
    time_of_day is not null;

-- Add helpful comment
comment on
table public.agenda_blocks is 'High-level planning blocks for Intent Calendar - flexible soft scheduling without exact time tracking';