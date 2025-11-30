/**
 * Smart Reminder Messages
 * Context-aware notification message builder
 */

export interface ReminderState {
  isIdle: boolean;
  lastLogTime: Date | null;
  recentContextSwitch: boolean;
  logsTodayCount: number;
  idleDurationMinutes?: number;
}

export interface ReminderMessage {
  title: string;
  body: string;
}

/**
 * Build context-aware reminder message
 */
export function buildReminderMessage(state: ReminderState): ReminderMessage {
  const now = new Date();
  const lastLogTime = state.lastLogTime;
  
  // Calculate time since last log
  let minutesSinceLastLog: number | null = null;
  if (lastLogTime) {
    minutesSinceLastLog = Math.floor((now.getTime() - lastLogTime.getTime()) / (1000 * 60));
  }

  // Idle for extended period (> 10 minutes)
  if (state.isIdle && (state.idleDurationMinutes || 0) > 10) {
    return {
      title: "Back at it?",
      body: "Log what you're about to do to track your progress.",
    };
  }

  // Recent context switch detected
  if (state.recentContextSwitch) {
    return {
      title: "New task?",
      body: "Log your current activity to keep your timeline accurate.",
    };
  }

  // No logs in last 2 hours
  if (minutesSinceLastLog !== null && minutesSinceLastLog > 120) {
    return {
      title: "Time to log?",
      body: `You haven't logged anything in a while. Want to track what you're doing?`,
    };
  }

  // No logs today at all
  if (state.logsTodayCount === 0) {
    return {
      title: "Start tracking",
      body: "Log your first activity to begin tracking your day.",
    };
  }

  // Idle state
  if (state.isIdle) {
    return {
      title: "Taking a break?",
      body: "Log this break time to complete your activity timeline.",
    };
  }

  // Default friendly reminder
  return {
    title: "What are you doing right now?",
    body: "Log your current activity to keep your timeline updated.",
  };
}

/**
 * Get reminder mode presets (for frequency selection)
 */
export function getReminderModePresets(mode: "low" | "medium" | "high"): {
  min: number;
  max: number;
} {
  switch (mode) {
    case "low":
      return { min: 30, max: 60 };
    case "medium":
      return { min: 20, max: 45 };
    case "high":
      return { min: 15, max: 30 };
    default:
      return { min: 20, max: 45 };
  }
}

