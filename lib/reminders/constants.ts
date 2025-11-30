/**
 * Reminder system constants
 * Single source of truth for reminder configuration
 */

// Timing constants
export const MIN_REMINDER_INTERVAL_MINUTES = 5;
export const MAX_REMINDER_INTERVAL_MINUTES = 120;
export const DEFAULT_MIN_INTERVAL_MINUTES = 15;
export const DEFAULT_MAX_INTERVAL_MINUTES = 60;

// Anti-annoyance constants
export const MIN_REMINDER_SPACING_MINUTES = 10; // Never show reminders within this time
export const MAX_REMINDERS_PER_DAY = 20;
export const AUTO_SNOOZE_AFTER_DISMISSALS = 3;
export const AUTO_SNOOZE_DURATION_MINUTES = 60;

// Activity monitoring constants
export const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
export const THROTTLE_INTERVAL_MS = 2000; // 2 seconds for activity events

// Reminder mode presets
export const REMINDER_MODE_PRESETS = {
  low: { min: 30, max: 60 },
  medium: { min: 20, max: 45 },
  high: { min: 15, max: 30 },
} as const;

// Notification constants
export const NOTIFICATION_TAG = "dayflow-reminder";
export const NOTIFICATION_AUTO_CLOSE_MS = 10000; // 10 seconds

// Logs summary refresh interval
export const LOGS_SUMMARY_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

