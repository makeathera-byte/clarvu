-- DAYFLOW – PROMPT 7B  
-- SUPABASE-SIDE LOGIC FOR GOOGLE CALENDAR INTEGRATION
-- Tables user_integrations & calendar_events already exist.
-- Here we add RPC, helpers, indexes, and cleanup tools.


------------------------------------------------------------
-- 1) CREATE AN UPSERT FUNCTION FOR GOOGLE EVENTS
-- This lets the Next.js app sync events efficiently in bulk.
------------------------------------------------------------

create or replace function public.upsert_calendar_event(
    _user_id uuid,
    _external_id text,
    _title text,
    _description text,
    _start_time timestamptz,
    _end_time timestamptz,
    _source text default 'google'
)
returns void
language plpgsql
as $$
begin
  insert into public.calendar_events (
    user_id, external_id, title, description, start_time, end_time, source
  )
  values (
    _user_id, _external_id, _title, _description, _start_time, _end_time, _source
  )
  on conflict (external_id, user_id)
  do update set
    title = excluded.title,
    description = excluded.description,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    source = excluded.source;
end;
$$;


------------------------------------------------------------
-- 2) ALLOW CLIENT TO CALL THIS FUNCTION (RLS SAFE)
------------------------------------------------------------

grant execute on function public.upsert_calendar_event(
  uuid, text, text, text, timestamptz, timestamptz, text
) to authenticated;


------------------------------------------------------------
-- 3) INDEXES FOR FAST CALENDAR QUERIES
------------------------------------------------------------

-- Query by date
create index if not exists calendar_events_user_time_idx
on public.calendar_events (user_id, start_time);

-- Query by external_id
create index if not exists calendar_events_external_idx
on public.calendar_events (external_id);


------------------------------------------------------------
-- 4) OPTIONAL: CLEAR OLD EVENTS FOR A USER
-- Useful if user re-syncs and you want a fresh rebuild.
------------------------------------------------------------

create or replace function public.delete_calendar_events_for_user(_user_id uuid)
returns void
language plpgsql
as $$
begin
  delete from public.calendar_events
  where user_id = _user_id;
end;
$$;

grant execute on function public.delete_calendar_events_for_user(uuid) to authenticated;


------------------------------------------------------------
-- 5) OPTIONAL: AUTO-REFRESH TOKEN STORAGE FIELD
-- This doesn't do refresh itself, but helps tracking refreshes.
------------------------------------------------------------

alter table public.user_integrations
add column if not exists last_refreshed timestamptz;


------------------------------------------------------------
-- 6) TRIGGER TO AUTO-UPDATE updated_at IN user_integrations
------------------------------------------------------------

create trigger user_integrations_updated
before update on public.user_integrations
for each row execute procedure moddatetime(updated_at);
