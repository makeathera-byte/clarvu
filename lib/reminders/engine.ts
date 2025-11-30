/**
 * Reminder Engine
 * Intelligent, context-aware reminder timing logic
 * No AI - pure deterministic rules
 */

export interface ReminderOptions {
  lastReminderAt: Date | null;
  now: Date;
  isIdle: boolean;
  contextSwitchCountLastHour: number;
  focusState: "deep" | "shallow" | "idle";
  userSettings: {
    notifications_enabled: boolean;
    smart_reminders_enabled: boolean;
    min_reminder_interval_minutes: number;
    max_reminder_interval_minutes: number;
    quiet_hours_start: string | null; // "HH:mm" format
    quiet_hours_end: string | null; // "HH:mm" format
    reminder_interval?: number; // Fallback for non-smart mode
  };
}

/**
 * Calculate when the next reminder should fire
 * Returns null if reminders should not fire
 */
export function calculateNextReminderTime(options: ReminderOptions): Date | null {
  const {
    lastReminderAt,
    now,
    isIdle,
    contextSwitchCountLastHour,
    focusState,
    userSettings,
  } = options;

  // Rule 1: If notifications disabled, never remind
  if (!userSettings.notifications_enabled) {
    return null;
  }

  // Rule 2: Check quiet hours
  if (isInQuietHours(now, userSettings.quiet_hours_start, userSettings.quiet_hours_end)) {
    return null;
  }

  // Calculate base interval
  let intervalMinutes: number;

  if (userSettings.smart_reminders_enabled) {
    // Smart reminders: Adaptive interval based on context
    intervalMinutes = calculateSmartInterval({
      focusState,
      isIdle,
      contextSwitchCountLastHour,
      minInterval: userSettings.min_reminder_interval_minutes,
      maxInterval: userSettings.max_reminder_interval_minutes,
    });
  } else {
    // Fixed interval mode
    intervalMinutes = userSettings.reminder_interval || 30;
  }

  // If we have a last reminder time, calculate next from there
  if (lastReminderAt) {
    const nextReminderAt = new Date(lastReminderAt.getTime() + intervalMinutes * 60 * 1000);
    
    // Don't schedule if it's in the past (should fire immediately)
    if (nextReminderAt <= now) {
      return now; // Fire immediately
    }
    
    // Check if next reminder would be in quiet hours
    if (isInQuietHours(nextReminderAt, userSettings.quiet_hours_start, userSettings.quiet_hours_end)) {
      // Skip to after quiet hours
      return getNextTimeAfterQuietHours(nextReminderAt, userSettings.quiet_hours_start, userSettings.quiet_hours_end);
    }
    
    return nextReminderAt;
  }

  // No previous reminder - schedule one now (or after minimum interval)
  const minInterval = userSettings.min_reminder_interval_minutes;
  const nextReminderAt = new Date(now.getTime() + minInterval * 60 * 1000);
  
  // Check quiet hours
  if (isInQuietHours(nextReminderAt, userSettings.quiet_hours_start, userSettings.quiet_hours_end)) {
    return getNextTimeAfterQuietHours(nextReminderAt, userSettings.quiet_hours_start, userSettings.quiet_hours_end);
  }
  
  return nextReminderAt;
}

/**
 * Calculate smart interval based on context
 */
function calculateSmartInterval(options: {
  focusState: "deep" | "shallow" | "idle";
  isIdle: boolean;
  contextSwitchCountLastHour: number;
  minInterval: number;
  maxInterval: number;
}): number {
  const { focusState, isIdle, contextSwitchCountLastHour, minInterval, maxInterval } = options;
  
  let interval = minInterval;

  // Deep work: Stretch interval (less frequent reminders)
  if (focusState === "deep") {
    interval = maxInterval * 0.85; // 85% of max = longer intervals
  }
  // Idle: Shorter, gentle nudges
  else if (isIdle) {
    interval = minInterval * 1.2; // Slightly longer than min when idle
  }
  // High context switching: Slightly stretch (don't spam)
  else if (contextSwitchCountLastHour > 10) {
    interval = Math.min(maxInterval, minInterval * 1.5);
  }
  // Shallow work: Medium interval
  else if (focusState === "shallow") {
    interval = (minInterval + maxInterval) / 2;
  }
  // Default: Use medium
  else {
    interval = (minInterval + maxInterval) / 2;
  }

  // Ensure within bounds
  return Math.max(minInterval, Math.min(maxInterval, Math.round(interval)));
}

/**
 * Check if a time is within quiet hours
 */
function isInQuietHours(
  date: Date,
  quietStart: string | null,
  quietEnd: string | null
): boolean {
  if (!quietStart || !quietEnd) {
    return false; // No quiet hours configured
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const [startHour, startMin] = quietStart.split(":").map(Number);
  const [endHour, endMin] = quietEnd.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle quiet hours that span midnight (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    // Spans midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same day
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Get next time after quiet hours end
 */
function getNextTimeAfterQuietHours(
  date: Date,
  quietStart: string | null,
  quietEnd: string | null
): Date {
  if (!quietStart || !quietEnd) {
    return date;
  }

  const [endHour, endMin] = quietEnd.split(":").map(Number);
  const nextTime = new Date(date);
  nextTime.setHours(endHour, endMin, 0, 0);

  // If quiet hours span midnight and we're before midnight, move to next day
  const [startHour] = quietStart.split(":").map(Number);
  if (startHour > endHour && nextTime < date) {
    nextTime.setDate(nextTime.getDate() + 1);
  }

  return nextTime;
}

