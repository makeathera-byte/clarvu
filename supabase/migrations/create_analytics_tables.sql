-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  device TEXT NOT NULL DEFAULT 'unknown',
  country TEXT NOT NULL DEFAULT 'unknown',
  visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create signup_events table
CREATE TABLE IF NOT EXISTS signup_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create usage_events table
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event TEXT NOT NULL,
  value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);

CREATE INDEX IF NOT EXISTS idx_signup_events_user_id ON signup_events(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_events_signed_up_at ON signup_events(signed_up_at);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events(event);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_value ON usage_events(value) WHERE value IS NOT NULL;

-- RLS Policies
-- Allow server-side inserts (service role will bypass RLS)
-- For client-side, users can only see their own data

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Visits: Users can see their own visits
CREATE POLICY "Users can view their own visits"
  ON visits FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Signup events: Users can see their own signup
CREATE POLICY "Users can view their own signup"
  ON signup_events FOR SELECT
  USING (auth.uid() = user_id);

-- Usage events: Users can see their own events
CREATE POLICY "Users can view their own usage events"
  ON usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Inserts are handled server-side with service role, so no insert policies needed
-- The service role bypasses RLS

