# Daily Summary Edge Function

This Edge Function generates daily AI summaries for each user at their specified time.

## Configuration

### Cron Schedule

This function needs to run **hourly** to check each user's individual `ai_summary_time` setting.

**Required cron schedule:** `0 * * * *` (runs every hour at minute 0)

### Setup in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/functions
2. Click on `daily-summary` function
3. Navigate to **"Cron Jobs"** or **"Triggers"** section
4. Add new cron job:
   - **Name**: `daily-summary-hourly`
   - **Schedule**: `0 * * * *`
   - **Function**: `daily-summary`
   - **Enabled**: ✅ Yes

### Alternative: More Frequent (Optional)

For faster summary generation (within 30 minutes of set time):
- **Schedule**: `*/30 * * * *` (runs every 30 minutes)

## How It Works

1. Function runs on schedule (hourly or every 30 minutes)
2. For each user:
   - Fetches their `ai_summary_time` from `user_settings` table
   - Checks if current time >= their set time (within 30-min window)
   - Checks if summary already exists for today
   - If conditions met → generates AI summary using Groq
3. Summary saved to `daily_summaries` table
4. Frontend polls for new summaries and shows notifications

## Environment Variables Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `GROQ_API_KEY` - Groq API key for AI generation

## Manual Testing

You can manually trigger the function:

```bash
curl -X POST https://yklexlqvofsxiajmewhy.supabase.co/functions/v1/daily-summary \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or use Supabase Dashboard → Functions → daily-summary → Invoke

## Response Format

```json
{
  "success": true,
  "processed": 2,
  "current_time": "2024-01-15T22:00:00.000Z",
  "results": [
    {
      "user_id": "uuid",
      "status": "success",
      "focus_score": 85,
      "summary_date": "2024-01-15"
    }
  ]
}
```

