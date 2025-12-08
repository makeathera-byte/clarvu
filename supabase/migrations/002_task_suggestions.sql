-- Task Suggestions Table
-- Stores global and user-specific task suggestions for autocomplete

create table if not exists public.task_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  text text not null,
  category_id uuid references public.categories(id) on delete set null,
  frequency int default 1,
  last_used timestamptz default now(),
  is_global boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_suggestions_user on public.task_suggestions(user_id);
create index if not exists idx_suggestions_text on public.task_suggestions using gin(to_tsvector('english', text));
create index if not exists idx_suggestions_global on public.task_suggestions(is_global) where is_global = true;
create index if not exists idx_suggestions_category on public.task_suggestions(category_id);

-- RLS Policies
alter table public.task_suggestions enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users read own suggestions and global" on public.task_suggestions;
drop policy if exists "Users insert own suggestions" on public.task_suggestions;
drop policy if exists "Users update own suggestions" on public.task_suggestions;
drop policy if exists "Users delete own suggestions" on public.task_suggestions;

create policy "Users read own suggestions and global"
on public.task_suggestions for select
using (user_id = auth.uid() OR is_global = true);

create policy "Users insert own suggestions"
on public.task_suggestions for insert
with check (user_id = auth.uid() AND is_global = false);

create policy "Users update own suggestions"
on public.task_suggestions for update
using (user_id = auth.uid() AND is_global = false);

create policy "Users delete own suggestions"
on public.task_suggestions for delete
using (user_id = auth.uid() AND is_global = false);

-- Seed global suggestions
-- Note: These are category-agnostic global suggestions
-- Category-specific suggestions will be added based on user's categories

insert into public.task_suggestions (text, is_global, frequency) values
-- Growth / Content
('Create content', true, 100),
('Shoot video', true, 90),
('Edit video', true, 85),
('Publish reel', true, 80),
('Lead outreach', true, 75),
('Sales calls', true, 70),
('Marketing research', true, 65),
('Email campaign', true, 60),
('Social media post', true, 55),
('Write blog post', true, 50),

-- Business / Client Work
('Client work', true, 100),
('Project delivery', true, 90),
('Revision work', true, 85),
('Client meeting', true, 80),
('Support tasks', true, 75),
('Proposal writing', true, 70),
('Invoice preparation', true, 65),

-- Product / Build
('Code feature', true, 100),
('Fix bugs', true, 95),
('UI improvements', true, 90),
('Testing', true, 85),
('Documentation', true, 80),
('Code review', true, 75),
('Deploy to production', true, 70),
('Database optimization', true, 65),

-- Operations / Admin
('Finance update', true, 90),
('Planning', true, 85),
('Backend cleanup', true, 80),
('Admin tasks', true, 75),
('Team meeting', true, 70),
('Email inbox', true, 65),
('File organization', true, 60),

-- Learning / Skill
('Study course', true, 85),
('Read article', true, 80),
('Practice coding', true, 75),
('Watch tutorial', true, 70),
('Take notes', true, 65),

-- Personal / Health
('Gym', true, 100),
('Walk', true, 95),
('Meal prep', true, 90),
('Meditation', true, 85),
('Journal', true, 80),
('Sleep early', true, 75),
('Drink water', true, 70),

-- Routine
('Morning routine', true, 90),
('Evening routine', true, 85),
('Weekly review', true, 80),
('Daily planning', true, 75),

-- Waste / Distraction
('Scrolling', true, 50),
('Random YouTube', true, 45),
('Procrastination', true, 40),
('Social media browsing', true, 35)
on conflict do nothing;
