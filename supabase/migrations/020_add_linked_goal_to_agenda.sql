-- Add linked_goal_id column to agenda_blocks table
-- This allows agenda blocks to be linked to specific goals

ALTER TABLE public.agenda_blocks
ADD COLUMN IF NOT EXISTS linked_goal_id uuid REFERENCES public.goals (id) ON DELETE SET NULL;

-- Add index for efficient goal lookups
CREATE INDEX IF NOT EXISTS idx_agenda_blocks_linked_goal ON public.agenda_blocks (linked_goal_id)
WHERE
    linked_goal_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.agenda_blocks.linked_goal_id IS 'Optional reference to a related goal';