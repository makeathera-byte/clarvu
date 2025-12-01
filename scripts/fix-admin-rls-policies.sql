-- Fix RLS policies to allow admin access
-- Admin queries use service role key which bypasses RLS, but let's ensure policies are correct

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own visits" ON visits;
DROP POLICY IF EXISTS "Users can view their own signup" ON signup_events;
DROP POLICY IF EXISTS "Users can view their own usage events" ON usage_events;

-- Recreate policies
-- Visits: Users can see their own visits, and anonymous visits are visible
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

-- Note: Server-side inserts with service role key bypass RLS automatically
-- The service role key is used in server actions, so admin queries will work

