-- Migration: Fix removal of unique constraint on goals
-- Description: Properly drop the unique index that limits one active goal per period

-- Drop the unique index that was created in 005_goals.sql
DROP INDEX IF EXISTS unique_active_goal_per_period;

-- Add comment to confirm multiple goals per period are now allowed
COMMENT ON
TABLE goals IS 'Users can have up to 10 active goals per period (7d, 30d, or 365d)';