-- Migration: Enhance goals table for multiple goals per category
-- Description: Remove unique constraint, add priority, progress, notes, sub_goals, and order_index

-- Remove unique constraint that limits one active goal per period
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_period_status_key;

-- Add new columns for enhanced goal features
ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE goals ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE goals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS sub_goals JSONB DEFAULT '[]'::jsonb;

-- Add index for efficient querying of active goals by user, period, and order
CREATE INDEX IF NOT EXISTS idx_goals_user_period_status_order ON goals(user_id, period, status, order_index);

-- Update existing goals to have default order_index based on creation date
UPDATE goals 
SET order_index = COALESCE(
    (SELECT COUNT(*) FROM goals g2 
     WHERE g2.user_id = goals.user_id 
     AND g2.period = goals.period 
     AND g2.created_at < goals.created_at), 
    0
)
WHERE order_index = 0;

-- Add comment to table
COMMENT ON COLUMN goals.priority IS 'Priority level: high, medium, or low';
COMMENT ON COLUMN goals.progress_percentage IS 'Manual progress tracking from 0 to 100';
COMMENT ON COLUMN goals.notes IS 'Additional notes or description for the goal';
COMMENT ON COLUMN goals.order_index IS 'Order of goals within a category (0-based)';
COMMENT ON COLUMN goals.sub_goals IS 'JSON array of sub-goals: [{id, text, completed}]';
