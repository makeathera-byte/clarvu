# MARK 10 — Notifications 2.0

## Overview

Upgraded the reminder system from static interval-based notifications to an **intelligent, context-aware, anti-annoyance reminder engine**.

## Features Implemented

### 1. Database Extensions

- **Extended `user_settings` table** with new notification fields:
  - `notifications_enabled` (boolean)
  - `smart_reminders_enabled` (boolean)
  - `min_reminder_interval_minutes` (integer, 5-60)
  - `max_reminder_interval_minutes` (integer, 15-120)
  - `quiet_hours_start` (time, nullable)
  - `quiet_hours_end` (time, nullable)
  - `reminder_mode` (text: 'low' | 'medium' | 'high')

**Migration:** `supabase/migrations/extend_user_settings_notifications.sql`

### 2. Reminder Engine (`lib/reminders/engine.ts`)

Intelligent reminder timing logic with:
- Context-aware interval calculation
- Deep work detection (stretches intervals)
- Idle state handling (gentle nudges)
- Quiet hours support
- Smart vs. fixed mode

### 3. Smart Nudge Messages (`lib/reminders/messages.ts`)

Context-aware notification messages:
- Idle detection: "Back at it? Log what you're about to do."
- Context switch: "New task? Log your current activity..."
- Long inactivity: "You haven't logged anything in a while..."
- Break time: "Taking a break? Log this break time..."

### 4. Upgraded ReminderClient

**Features:**
- Context-aware reminder timing
- Anti-annoyance rules:
  - Minimum 10-minute spacing between reminders
  - Max 20 reminders per day
  - Auto-snooze after 3 dismissals (1 hour)
- Quiet hours respect
- Integration with BrowserActivityMonitor
- Logs summary fetching (every 5 minutes)
- Inline banner for denied notifications

**Location:** `components/notifications/ReminderClient.tsx`

### 5. Logs Summary API

**Endpoint:** `GET /api/logs/summary`

Returns lightweight summary of today's logs:
- `lastLogTime`
- `logsTodayCount`
- `lastActivity`
- `lastCategory`

Used by ReminderClient to build context-aware messages.

### 6. Inline Reminder Banner

Component shown when notifications are denied:
- Shows option to enable notifications
- Subtle, minimal design
- Auto-dismisses on enable

**Location:** `components/notifications/InlineReminderBanner.tsx`

### 7. Settings UI

**New component:** `components/settings/ReminderSettingsForm.tsx`

Controls:
- Toggle: Enable reminders
- Toggle: Smart reminders
- Dropdown: Reminder frequency (Low/Medium/High)
- Time pickers: Quiet hours (optional)

**Updated:** `app/settings/page.tsx` to include new form

### 8. Server Actions

**New file:** `app/settings/reminderActions.ts`

Function: `updateReminderSettings()` - Updates all reminder settings

## Integration Points

### Dashboard Integration

The dashboard now:
1. Fetches full user settings
2. Passes settings to `ReminderClient`
3. Connects `ActivityMonitorWrapper` to `ReminderClient` via window global
4. Shows inline banner if notifications denied

**Updated:** `app/dashboard/page.tsx`

## Anti-Annoyance Rules

1. **Minimum spacing:** 10 minutes between reminders
2. **Daily limit:** Maximum 20 reminders per day
3. **Auto-snooze:** After 3 dismissals, snooze for 1 hour
4. **Quiet hours:** No reminders during configured quiet hours
5. **Context-aware:** Stretches intervals during deep work

## Smart Reminder Logic

### Interval Calculation

**Deep work:** 85% of max interval (longer, less frequent)
**Idle:** 1.2x min interval (gentle nudges)
**High context switching:** 1.5x min interval (don't spam)
**Shallow work:** Average of min/max
**Default:** Average of min/max

### Frequency Presets

- **Low:** 30-60 minutes
- **Medium:** 20-45 minutes  
- **High:** 15-30 minutes

## Testing

1. **Enable notifications in Settings**
2. **Set reminder frequency** (Low/Medium/High)
3. **Configure quiet hours** (optional)
4. **Enable smart reminders** for adaptive behavior
5. **Wait for reminders** - they should appear based on context

## Files Created/Modified

### Created
- `supabase/migrations/extend_user_settings_notifications.sql`
- `lib/reminders/engine.ts`
- `lib/reminders/messages.ts`
- `components/notifications/InlineReminderBanner.tsx`
- `components/settings/ReminderSettingsForm.tsx`
- `app/settings/reminderActions.ts`
- `app/api/logs/summary/route.ts`
- `components/ui/switch.tsx`

### Modified
- `components/notifications/ReminderClient.tsx` (major upgrade)
- `app/settings/page.tsx`
- `app/dashboard/page.tsx`
- `package.json` (added @radix-ui/react-switch)

## Dependencies Added

- `@radix-ui/react-switch` - For toggle switches in settings

## Next Steps

The reminder system is now fully functional. To test:
1. Go to Settings → Reminder Behavior
2. Enable reminders
3. Configure your preferences
4. Return to Dashboard
5. Reminders will appear based on your context and settings

---

**Status:** ✅ Complete  
**Date:** MARK 10 Implementation

