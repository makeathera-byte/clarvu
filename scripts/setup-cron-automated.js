/**
 * Automated Cron Jobs Setup Script
 * 
 * This script generates a ready-to-use SQL file with your service role key
 * embedded, so you can easily set up cron jobs.
 * 
 * Usage:
 *   node scripts/setup-cron-automated.js
 * 
 * Make sure SUPABASE_SERVICE_ROLE_KEY is in your .env.local file
 */

const fs = require('fs');
const path = require('path');

// Read service role key from environment or .env.local
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
      if (match) {
        serviceRoleKey = match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (err) {
    // Ignore errors reading .env.local
  }
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found!');
  console.error('\nPlease add it to your .env.local file:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  console.error('Or find it at:');
  console.error('   https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/settings/api\n');
  process.exit(1);
}

console.log('🚀 Generating cron setup SQL with your service role key...\n');

const sqlWithKey = `-- ============================================
-- DayFlow Cron Jobs Setup Script (AUTO-GENERATED)
-- ============================================
-- This file was generated automatically with your service role key.
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Daily Summary (hourly)
SELECT cron.unschedule('daily-summary-hourly') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-summary-hourly');

SELECT cron.schedule(
  'daily-summary-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceRoleKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Weekly Summary (Sunday 3 AM UTC)
SELECT cron.unschedule('weekly-summary-sunday') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-summary-sunday');

SELECT cron.schedule(
  'weekly-summary-sunday',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceRoleKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Monthly Summary (2nd of month, 3 AM UTC)
SELECT cron.unschedule('monthly-summary-2nd') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'monthly-summary-2nd');

SELECT cron.schedule(
  'monthly-summary-2nd',
  '0 3 2 * *',
  $$
  SELECT net.http_post(
    url := 'https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/monthly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceRoleKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify cron jobs were created
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE WHEN active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM cron.job 
WHERE jobname IN ('daily-summary-hourly', 'weekly-summary-sunday', 'monthly-summary-2nd')
ORDER BY jobname;
`;

try {
  const outputPath = path.join(__dirname, 'setup-cron-jobs-with-key.sql');
  fs.writeFileSync(outputPath, sqlWithKey.trim());
  
  console.log('✅ Generated: scripts/setup-cron-jobs-with-key.sql\n');
  console.log('📋 Next Steps:\n');
  console.log('   1. Open Supabase SQL Editor:');
  console.log('      https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new\n');
  console.log('   2. Copy and paste the contents of:');
  console.log('      scripts/setup-cron-jobs-with-key.sql\n');
  console.log('   3. Click "RUN"\n');
  console.log('   Done! Your cron jobs will be set up automatically. 🎉\n');
  
} catch (err) {
  console.error('❌ Error generating SQL file:', err.message);
  process.exit(1);
}
