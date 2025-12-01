# Admin Panel Setup Guide

## 1. Create Analytics Tables

Run the SQL migration in your Supabase dashboard:

```sql
-- See: supabase/migrations/create_analytics_tables.sql
```

Or run it directly in the Supabase SQL Editor.

## 2. Make User Admin

The admin email is configured in `middleware.ts` and `app/ppadminpp/actions.ts`:

- Default: `makeathera@gmail.com`
- Can be overridden with `ADMIN_EMAIL` environment variable

To create/update the admin user:

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the script
npx tsx scripts/make-admin.ts
```

Or manually create the user in Supabase Auth dashboard with email `makeathera@gmail.com` and password `pp06082006pp`.

## 3. Access Admin Panel

Navigate to: `/ppadminpp`

The admin panel includes:
- **Overview**: High-level stats and charts
- **Traffic**: Visit analytics by page, device, country
- **Users**: User growth, retention, activity
- **Usage**: Feature usage metrics
- **System Health**: Errors, slow routes, cron status

## 4. Event Logging

The system automatically logs:
- **Visits**: Tracked in middleware for dynamic pages
- **Signups**: Logged in auth callback route
- **Usage Events**: 
  - `log_created` - When user creates a log
  - `routine_generated` - When user generates a routine
  - `summary_opened` - When user opens a summary (to be added)
  - `reminder_clicked` - When user clicks a reminder (to be added)
  - `error` - System errors
  - `cron_success` - Successful cron jobs

## 5. Environment Variables

Add to `.env.local`:

```env
ADMIN_EMAIL=makeathera@gmail.com
```

## Notes

- Admin routes are protected in `middleware.ts`
- All analytics tables have RLS enabled
- Server-side inserts bypass RLS (service role)
- Client-side queries respect RLS policies

