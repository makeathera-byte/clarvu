-- Calendar Optimizations Migration
-- Adds indexes for efficient date-range queries on calendar views

-- Add indexes for fast calendar date filtering
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON public.tasks (start_time);

CREATE INDEX IF NOT EXISTS idx_tasks_end_time ON public.tasks (end_time);

-- Composite index for user-specific calendar queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_start_time ON public.tasks (user_id, start_time);

-- Index for filtering by date range efficiently
CREATE INDEX IF NOT EXISTS idx_tasks_user_date_range ON public.tasks (user_id, start_time, end_time);

-- Index for finding active tasks quickly
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks (user_id, status);