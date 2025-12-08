-- DAYFLOW – ADMIN BACKEND SETUP
-- URL for panel: /ppadminpp
-- Only admins can access admin data.
-- This SQL creates all necessary admin-side structures.

------------------------------------------------------------
-- 1) ADD is_admin + disabled FLAGS TO PROFILES
------------------------------------------------------------
alter table public.profiles
add column if not exists is_admin boolean default false;

alter table public.profiles
add column if not exists disabled boolean default false;

-- Make YOUR account admin manually:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';


------------------------------------------------------------
-- 2) SYSTEM LOGS TABLE (Admin Dashboard Reads These)
------------------------------------------------------------

create table if not exists public.system_logs (
  id bigserial primary key,
  created_at timestamptz default now(),
  level text not null,        -- 'info', 'warn', 'error'
  message text not null,
  meta jsonb
);

-- Index for time-based queries
create index if not exists system_logs_created_idx
on public.system_logs (created_at desc);


------------------------------------------------------------
-- 3) ADMIN USAGE ANALYTICS VIEWS
------------------------------------------------------------

-- Total user analytic view
create or replace view public.admin_user_usage_view as
select
  p.id as user_id,
  p.full_name,
  p.email,
  p.is_admin,
  p.created_at,
  p.last_login,
  p.disabled,
  (
    select count(*)
    from public.tasks t
    where t.user_id = p.id
  ) as total_tasks,
  (
    select sum(
      extract(epoch from (t.end_time - t.start_time)) / 60
    )
    from public.tasks t
    where t.user_id = p.id and t.end_time is not null
  ) as total_minutes
from public.profiles p;


------------------------------------------------------------
-- 4) SYSTEM-WIDE STATS VIEW
------------------------------------------------------------

create or replace view public.admin_system_stats_view as
select
  (select count(*) from public.profiles) as total_users,
  (select count(*) from public.profiles where last_login >= now() - interval '1 day') as dau,
  (select count(*) from public.profiles where last_login >= now() - interval '7 day') as wau,
  (select count(*) from public.tasks) as total_tasks,
  (select count(*) from public.tasks where start_time >= date_trunc('day', now())) as tasks_today,
  (select count(*) from public.active_timers) as active_timers,
  (select count(*) from public.user_integrations where provider='google_calendar') as calendar_integrations
;


------------------------------------------------------------
-- 5) CALENDAR INTEGRATION HEALTH VIEW
------------------------------------------------------------

create or replace view public.admin_calendar_health_view as
select
  ui.user_id,
  p.full_name,
  p.email,
  ui.access_token is not null as connected,
  ui.last_refreshed,
  case 
    when ui.last_refreshed < now() - interval '7 day' 
    then true 
    else false 
  end as token_expired,
  count(ev.id) as events_today
from public.user_integrations ui
left join public.profiles p on p.id = ui.user_id
left join public.calendar_events ev 
  on ev.user_id = ui.user_id 
  and ev.start_time >= date_trunc('day', now()) 
  and ev.start_time < date_trunc('day', now()) + interval '1 day'
where ui.provider = 'google_calendar'
group by ui.user_id, p.full_name, p.email, ui.access_token, ui.last_refreshed;


------------------------------------------------------------
-- 6) RLS FOR ADMIN-ONLY TABLES/VIEWS
------------------------------------------------------------

-- Enable RLS
alter table public.system_logs enable row level security;

-- Remove public access
revoke select on public.system_logs from anon;
revoke select on public.system_logs from authenticated;

-- ALLOW ONLY ADMINS
create policy "admins_read_logs" on public.system_logs
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- SAME FOR VIEWS
grant usage on schema public to authenticated;

revoke all on public.admin_user_usage_view from anon;
revoke all on public.admin_user_usage_view from authenticated;

revoke all on public.admin_system_stats_view from anon;
revoke all on public.admin_system_stats_view from authenticated;

revoke all on public.admin_calendar_health_view from anon;
revoke all on public.admin_calendar_health_view from authenticated;

grant select on public.admin_user_usage_view to authenticated;
grant select on public.admin_system_stats_view to authenticated;
grant select on public.admin_calendar_health_view to authenticated;


------------------------------------------------------------
-- 7) LOGGING FUNCTION FOR APP EVENTS
------------------------------------------------------------

create or replace function public.log_event(
  lvl text,
  msg text,
  metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
as $$
begin
  insert into public.system_logs (level, message, meta)
  values (lvl, msg, metadata);
end;
$$;

grant execute on function public.log_event(text, text, jsonb) to authenticated;
