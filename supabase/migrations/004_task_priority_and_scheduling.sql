-- Add priority and scheduling features to tasks
-- Migration: 004_task_priority_and_scheduling.sql

-- Add priority column to tasks table
-- Allowed values: 'low', 'medium', 'high'
-- Default: 'medium'
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Add is_scheduled column to tasks table
-- Indicates whether the task has a scheduled time
-- Default: true (for backward compatibility with existing tasks)
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_scheduled boolean DEFAULT true;

-- Update status constraint to include 'unscheduled' status
-- Drop existing constraint
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add new constraint with 'unscheduled' status
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'unscheduled'));

-- Update existing tasks to set appropriate values
-- Tasks without start_time should be marked as unscheduled
UPDATE public.tasks
SET is_scheduled = false, status = 'unscheduled'
WHERE start_time IS NULL AND status != 'completed';

-- Add index for faster querying by priority and scheduling status
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_is_scheduled ON public.tasks(is_scheduled);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON public.tasks(status, priority);
