-- Create routine_summaries table for caching AI-generated routines
CREATE TABLE IF NOT EXISTS routine_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  routine JSONB NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_date ON routine_summaries(user_id, date DESC);

-- Create index for rate limiting checks
CREATE INDEX IF NOT EXISTS idx_routine_summaries_user_created ON routine_summaries(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE routine_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own routine summaries
CREATE POLICY "Users can view their own routine summaries"
  ON routine_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routine summaries"
  ON routine_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine summaries"
  ON routine_summaries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_routine_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routine_summaries_updated_at
  BEFORE UPDATE ON routine_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_routine_summaries_updated_at();

