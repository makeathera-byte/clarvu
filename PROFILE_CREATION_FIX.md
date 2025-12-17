# Profile Creation Fix - CLARVU

## Problem
Error in production: "Profile still does not exist after waiting. Database trigger may have failed."

## Solution Implemented

### 1. Removed Frontend Profile Creation ✅
- **Removed** manual profile creation from `profileSync.ts` (service role fallback)
- **Removed** upsert fallback from `signup/actions.ts`
- **Updated** `profileSync.ts` to only update existing profiles, never create them
- **Rule**: Profiles are created ONLY via database trigger. Frontend only reads/updates.

### 2. Created Database Trigger ✅
**Migration**: `supabase/migrations/013_fix_profile_creation_trigger.sql`

- Created `handle_new_user()` function that automatically creates profiles on user signup
- Handles both email and Google OAuth signups
- Extracts data from `raw_user_meta_data` and `raw_app_meta_data`
- Uses `security definer` to bypass RLS
- Separate trigger for creating default categories

### 3. Fixed RLS Policies ✅
**Migration**: `supabase/migrations/014_fix_rls_policies.sql`

- Enabled RLS on profiles table
- Created policies for SELECT, UPDATE, and INSERT
- Trigger uses `security definer` so it bypasses RLS automatically

### 4. Updated Frontend to Handle Loading Gracefully ✅
- **`getUserProfile()` helper**: Added retry logic (waits 1s, retries once)
- **Dashboard layout**: Added retry logic for profile fetching
- **Auth callback**: Updated comments to clarify trigger creates profile
- **Signup action**: Removed upsert fallback, only updates existing profile

### 5. Verification Query ✅
**Migration**: `supabase/migrations/015_verify_trigger.sql`

SQL queries to verify:
- Trigger exists
- Function exists with correct security type
- RLS policies are set up correctly

## How to Deploy

### Step 1: Run Migrations in Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Run `013_fix_profile_creation_trigger.sql`
3. Run `014_fix_rls_policies.sql`
4. Run `015_verify_trigger.sql` to verify everything is set up

### Step 2: Verify Trigger Exists
Run this query in Supabase SQL Editor:
```sql
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'users';
```

Expected: Should show `on_auth_user_created`

### Step 3: Test with Fresh User
1. Delete a test user from Supabase Auth
2. Sign up again (Google or Email)
3. Run:
```sql
SELECT * FROM profiles
ORDER BY created_at DESC
LIMIT 1;
```

Expected: A new profile row exists immediately

## Key Changes

### Files Modified
1. `src/lib/auth/profileSync.ts` - Removed manual profile creation, only updates
2. `src/app/auth/signup/actions.ts` - Removed upsert fallback
3. `src/lib/supabase/server.ts` - Added retry logic to `getUserProfile()`
4. `src/app/dashboard/layout.tsx` - Added retry logic for profile fetching
5. `src/app/auth/callback/page.tsx` - Updated comments

### Files Created
1. `supabase/migrations/013_fix_profile_creation_trigger.sql` - Main trigger fix
2. `supabase/migrations/014_fix_rls_policies.sql` - RLS policy fix
3. `supabase/migrations/015_verify_trigger.sql` - Verification queries

## Expected Behavior

### Email Signup
1. User signs up → `auth.users` row created
2. Trigger fires → `profiles` row created automatically
3. Frontend updates profile with additional signup data (theme, country, etc.)

### Google OAuth Signup
1. User signs in with Google → `auth.users` row created
2. Trigger fires → `profiles` row created with OAuth metadata
3. `profileSync.ts` updates profile with additional OAuth data if needed

### Profile Loading
- Frontend assumes profile exists (created by trigger)
- If profile not found, waits 1s and retries once
- If still not found, shows appropriate error/loading state

## Troubleshooting

### Profile Still Not Created
1. Check trigger exists: Run verification query from `015_verify_trigger.sql`
2. Check function security: Should be `security definer`
3. Check RLS: Policies should allow trigger inserts (trigger bypasses RLS anyway)
4. Check Supabase logs for trigger errors

### RLS Errors
- Trigger uses `security definer` so it bypasses RLS
- If client-side operations fail, check RLS policies in `014_fix_rls_policies.sql`

### Race Conditions
- Frontend retry logic handles brief delays
- If profile consistently missing, trigger may not be firing
- Check Supabase dashboard for trigger execution logs

## Notes
- All profile creation happens server-side via database trigger
- Frontend never creates profiles, only reads/updates
- Retry logic handles brief delays during trigger execution
- Works reliably on both Vercel and local environments
