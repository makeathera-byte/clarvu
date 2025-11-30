-- Optimize history page queries with indexes

-- Index for activity_logs date range queries (most common)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date_range 
ON activity_logs(user_id, start_time DESC) 
WHERE end_time IS NOT NULL;

-- Index for daily_summaries date queries
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date 
ON daily_summaries(user_id, date DESC);

-- Index for weekly_summaries queries
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week 
ON weekly_summaries(user_id, week_start DESC);

-- Index for monthly_summaries queries
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_month 
ON monthly_summaries(user_id, month DESC);

-- Composite index for activity_logs with category filtering
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_category_date 
ON activity_logs(user_id, category_id, start_time DESC);

-- Index for routine_summaries date queries
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_date 
ON routine_summaries(user_id, date DESC);

-- Analyze tables to update statistics
ANALYZE activity_logs;
ANALYZE daily_summaries;
ANALYZE weekly_summaries;
ANALYZE monthly_summaries;
ANALYZE routine_summaries;

