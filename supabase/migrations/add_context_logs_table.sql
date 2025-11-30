-- Create context_logs table for future AI pattern learning
CREATE TABLE IF NOT EXISTS context_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_context_logs_user_id ON context_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_context_logs_detected_at ON context_logs(detected_at);

-- Enable RLS
ALTER TABLE context_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own context logs" ON context_logs;
CREATE POLICY "Users can view their own context logs"
  ON context_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own context logs" ON context_logs;
CREATE POLICY "Users can insert their own context logs"
  ON context_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Throttle: Only allow 1 insert per user per 5 minutes
-- This is enforced at the application level, but we add a unique constraint for safety
CREATE UNIQUE INDEX IF NOT EXISTS idx_context_logs_user_recent 
ON context_logs(user_id, detected_at) 
WHERE detected_at > NOW() - INTERVAL '5 minutes';

