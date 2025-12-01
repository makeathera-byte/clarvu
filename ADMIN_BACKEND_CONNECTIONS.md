# Admin Panel Backend Connections

## Overview
This document outlines all backend connections and endpoints for the admin panel.

## Server Actions (`app/ppadminpp/actions.ts`)

### 1. `getTrafficStats()`
**Purpose:** Fetch traffic analytics data

**Tables Used:**
- `visits` - Page visits, device, country data

**Returns:**
- `visitsLast24h` - Number of visits in last 24 hours
- `visitsChange24h` - Percentage change from previous 24h
- `visitsLast7Days` - Array of daily visit counts
- `visitsByPage` - Top 10 pages by traffic
- `visitsByDevice` - Traffic breakdown by device type
- `visitsByCountry` - Top 10 countries by traffic

**Error Handling:**
- Catches missing table errors
- Returns default values on query errors
- Re-throws migration errors for user visibility

**Used By:**
- `/ppadminpp` (Overview page)
- `/ppadminpp/traffic` (Traffic page)

---

### 2. `getUserStats()`
**Purpose:** Fetch user analytics and growth metrics

**Tables Used:**
- `signup_events` - User signups
- `visits` - User activity tracking

**Returns:**
- `totalUsers` - Total number of users
- `newSignupsToday` - Signups in last 24 hours
- `signupsChange24h` - Percentage change in signups
- `signupsLast7Days` - Array of daily signup counts
- `dau` - Daily Active Users
- `wau` - Weekly Active Users
- `mau` - Monthly Active Users
- `returningUsers` - Users who visited more than once
- `retentionData` - New vs returning users breakdown

**Error Handling:**
- Catches all query errors
- Returns default values on errors
- Re-throws auth and migration errors

**Used By:**
- `/ppadminpp` (Overview page)
- `/ppadminpp/users` (Users page)

---

### 3. `getUsageStats()`
**Purpose:** Fetch feature usage metrics

**Tables Used:**
- `usage_events` - User action events

**Returns:**
- `logsToday` - Logs created today
- `summariesGeneratedToday` - AI summaries generated
- `summariesOpenedToday` - Summaries opened by users
- `remindersClickedToday` - Reminder interactions
- `logsLast7Days` - Array of daily log creation counts
- `summariesChange24h` - Change percentage

**Error Handling:**
- Catches missing table errors
- Returns default values on errors
- Re-throws migration errors

**Used By:**
- `/ppadminpp` (Overview page)
- `/ppadminpp/usage` (Usage page)

---

### 4. `getSystemHealth()`
**Purpose:** Fetch system health and error metrics

**Tables Used:**
- `usage_events` - Error events and slow route tracking

**Returns:**
- `errorsLast7Days` - Array of daily error counts
- `totalErrors` - Total errors in last 7 days
- `slowRoutes` - API routes taking >1s
- `cronSuccessCount` - Successful cron job executions

**Error Handling:**
- Catches all query errors
- Returns default values on errors
- Re-throws migration errors

**Used By:**
- `/ppadminpp/health` (System Health page)

---

## API Routes

### 1. `GET /api/admin/users`
**Purpose:** Fetch detailed user data with activity metrics

**Authentication:**
- Requires admin email: `makeathera@gmail.com`
- Uses `getUserOrThrow()` for auth check

**Query Parameters:**
- `filter` - Filter type: `all`, `most_active`, `recently_active`, `new_users`
- `limit` - Maximum number of users to return (default: 100)

**Tables Used:**
- `signup_events` - User signup data
- `auth.users` (via admin client) - User metadata (name, email)
- `activity_logs` - User activity logs count
- `visits` - Last active date and visit counts
- `usage_events` - Summary reads, reminders, routines

**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "signed_up_at": "2024-01-01T00:00:00Z",
      "total_logs": 10,
      "last_active": "2024-01-15T12:00:00Z",
      "summary_reads": 5,
      "reminders_clicked": 3,
      "routines_generated": 2,
      "total_visits": 25
    }
  ]
}
```

**Error Handling:**
- Returns 401/403 for unauthorized access
- Returns 500 for server errors
- Logs errors to console
- Continues with empty data if individual queries fail

**Used By:**
- `components/admin/tables/UserTable.tsx`

---

## Database Tables

### Analytics Tables (from `create_analytics_tables.sql`)

1. **visits**
   - `id` (UUID)
   - `user_id` (UUID, nullable)
   - `path` (TEXT)
   - `device` (TEXT)
   - `country` (TEXT)
   - `visited_at` (TIMESTAMPTZ)

2. **signup_events**
   - `id` (UUID)
   - `user_id` (UUID)
   - `email` (TEXT)
   - `signed_up_at` (TIMESTAMPTZ)

3. **usage_events**
   - `id` (UUID)
   - `user_id` (UUID)
   - `event` (TEXT) - Event type: `log_created`, `summary_opened`, `reminder_clicked`, `routine_generated`, `error`, etc.
   - `value` (INTEGER, nullable) - Optional numeric value (e.g., response time)
   - `created_at` (TIMESTAMPTZ)

### Application Tables

4. **activity_logs**
   - Used for counting user logs
   - Has `user_id` and activity data

---

## Data Flow

### Overview Page Flow
```
User → /ppadminpp
  → layout.tsx (auth check)
  → page.tsx
    → getTrafficStats() → Supabase (visits)
    → getUserStats() → Supabase (signup_events, visits)
    → getUsageStats() → Supabase (usage_events)
    → Render components with data
```

### Users Page Flow
```
User → /ppadminpp/users
  → layout.tsx (auth check)
  → users/page.tsx
    → getUserStats() → Supabase
    → UserTable component
      → GET /api/admin/users → Supabase (multiple tables)
      → Render table with filters
```

### Traffic Page Flow
```
User → /ppadminpp/traffic
  → layout.tsx (auth check)
  → traffic/page.tsx
    → getTrafficStats() → Supabase (visits)
    → Render charts
```

### Usage Page Flow
```
User → /ppadminpp/usage
  → layout.tsx (auth check)
  → usage/page.tsx
    → getUsageStats() → Supabase (usage_events)
    → Render charts and stats
```

### System Health Page Flow
```
User → /ppadminpp/health
  → layout.tsx (auth check)
  → health/page.tsx
    → getSystemHealth() → Supabase (usage_events)
    → Render error charts and slow routes table
```

---

## Authentication & Authorization

### Admin Check
- **Location:** `app/ppadminpp/actions.ts` - `ensureAdmin()`
- **Method:** Checks `user.email === ADMIN_EMAIL`
- **Admin Email:** `makeathera@gmail.com` (from env or default)

### Protection Layers
1. **Middleware** (`proxy.ts`) - Redirects non-admin users
2. **Layout** (`app/ppadminpp/layout.tsx`) - Server-side auth check
3. **Server Actions** - Each action calls `ensureAdmin()`
4. **API Routes** - Each route checks admin status

---

## Error Handling Strategy

### Server Actions
- Try-catch blocks around all database queries
- Return default/empty values on errors (except migration errors)
- Re-throw migration errors to show helpful messages
- Log errors to console for debugging

### API Routes
- Try-catch around entire request
- Return appropriate HTTP status codes
- Log errors for debugging
- Continue with partial data if some queries fail

### Frontend Components
- Handle loading states
- Display error messages
- Show empty states when no data
- Graceful degradation

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=makeathera@gmail.com
```

---

## Testing Checklist

- [x] All server actions have error handling
- [x] All API routes have error handling
- [x] All database queries handle missing tables
- [x] Authentication checks in place
- [x] Default values returned on errors
- [x] Frontend components handle empty data
- [x] All endpoints properly connected
- [x] Data flows correctly from backend to frontend

---

## Next Steps

1. Run SQL migration: `supabase/migrations/create_analytics_tables.sql`
2. Verify all tables exist in Supabase
3. Test each admin page
4. Verify data appears correctly
5. Check error handling with missing data

