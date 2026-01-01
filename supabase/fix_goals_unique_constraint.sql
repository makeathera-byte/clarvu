-- Fix removal of unique constraint on goals
-- This allows users to have up to 10 active goals per period (7d, 30d, or 365d)

-- Drop the unique index that was created in 005_goals.sql
-- This index was preventing users from creating more than 1 active goal per period
DROP INDEX IF EXISTS unique_active_goal_per_period;

-- Verify the index is dropped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'unique_active_goal_per_period'
  ) THEN
    RAISE NOTICE 'Successfully removed unique_active_goal_per_period index. Users can now create up to 10 active goals per period.';
  ELSE
    RAISE WARNING 'Failed to remove unique_active_goal_per_period index. Please check permissions.';
  END IF;
END $$;