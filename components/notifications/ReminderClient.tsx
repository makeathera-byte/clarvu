"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ActivityEvent } from "@/components/monitor/BrowserActivityMonitor";
import { calculateNextReminderTime } from "@/lib/reminders/engine";
import { buildReminderMessage } from "@/lib/reminders/messages";
import { InlineReminderBanner } from "./InlineReminderBanner";

interface ReminderSettings {
  notifications_enabled: boolean;
  smart_reminders_enabled: boolean;
  min_reminder_interval_minutes: number;
  max_reminder_interval_minutes: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  reminder_interval?: number;
}

interface LogsSummary {
  lastLogTime: string | null;
  logsTodayCount: number;
  lastActivity: string | null;
  lastCategory: string | null;
}

interface ReminderClientProps {
  initialSettings: ReminderSettings;
  onContextChange?: (event: ActivityEvent) => void;
  onActivityHandlerReady?: (handler: (event: ActivityEvent) => void) => void;
}

// Anti-annoyance constants
const MIN_REMINDER_SPACING_MINUTES = 10; // Never show reminders within 10 minutes
const MAX_REMINDERS_PER_DAY = 20;
const AUTO_SNOOZE_AFTER_DISMISSALS = 3; // Auto-snooze after 3 dismissals
const AUTO_SNOOZE_DURATION_MINUTES = 60;

/**
 * Upgraded Reminder Client with context awareness
 */
export function ReminderClient({
  initialSettings,
  onContextChange,
  onActivityHandlerReady,
}: ReminderClientProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [settings, setSettings] = useState<ReminderSettings>(initialSettings);
  const [nextReminderAt, setNextReminderAt] = useState<Date | null>(null);
  const [lastReminderAt, setLastReminderAt] = useState<Date | null>(null);
  const [remindersToday, setRemindersToday] = useState(0);
  const [dismissalsCount, setDismissalsCount] = useState(0);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);
  const [logsSummary, setLogsSummary] = useState<LogsSummary | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReminderTimestampRef = useRef<number>(0);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      if (currentPermission === "default") {
        Notification.requestPermission().then((newPermission) => {
          setPermission(newPermission);
          if (newPermission === "denied") {
            setShowBanner(true);
          }
        });
      } else if (currentPermission === "denied") {
        setShowBanner(true);
      }
    }
  }, []);

  // Fetch logs summary
  const fetchLogsSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/logs/summary");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLogsSummary(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching logs summary:", error);
    }
  }, []);

  // Fetch logs summary on mount and periodically
  useEffect(() => {
    fetchLogsSummary();
    
    // Refresh every 5 minutes
    logsRefreshIntervalRef.current = setInterval(fetchLogsSummary, 5 * 60 * 1000);
    
    return () => {
      if (logsRefreshIntervalRef.current) {
        clearInterval(logsRefreshIntervalRef.current);
      }
    };
  }, [fetchLogsSummary]);

  // Handle activity changes from BrowserActivityMonitor
  const handleActivityChange = useCallback((event: ActivityEvent) => {
    setCurrentEvent(event);
    if (onContextChange) {
      onContextChange(event);
    }
  }, [onContextChange]);

  // Determine focus state from context
  const getFocusState = useCallback((): "deep" | "shallow" | "idle" => {
    if (!currentEvent) return "idle";
    
    if (currentEvent.isIdle) {
      return "idle";
    }
    
    // Simple heuristic: if window is focused and not idle, assume working
    // In a real implementation, this could be enhanced with activity detection
    return currentEvent.windowFocused ? "shallow" : "idle";
  }, [currentEvent]);

  // Calculate next reminder time using engine
  const recalculateNextReminder = useCallback(() => {
    if (!settings.notifications_enabled || permission !== "granted") {
      setNextReminderAt(null);
      return;
    }

    // Check if snoozed
    const now = new Date();
    if (snoozeUntil && now < snoozeUntil) {
      setNextReminderAt(snoozeUntil);
      return;
    }

    // Check anti-annoyance rules
    const timeSinceLastReminder = now.getTime() - lastReminderTimestampRef.current;
    const minSpacingMs = MIN_REMINDER_SPACING_MINUTES * 60 * 1000;
    if (timeSinceLastReminder < minSpacingMs) {
      const nextAllowed = new Date(lastReminderTimestampRef.current + minSpacingMs);
      setNextReminderAt(nextAllowed);
      return;
    }

    // Check daily limit
    if (remindersToday >= MAX_REMINDERS_PER_DAY) {
      // Reset tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setNextReminderAt(tomorrow);
      return;
    }

    // Use reminder engine to calculate next time
    const focusState = getFocusState();
    const contextSwitchCount = 0; // TODO: Track from ActivityMonitorWrapper
    
    const nextTime = calculateNextReminderTime({
      lastReminderAt,
      now,
      isIdle: currentEvent?.isIdle || false,
      contextSwitchCountLastHour: contextSwitchCount,
      focusState,
      userSettings: settings,
    });

    setNextReminderAt(nextTime);
  }, [
    settings,
    permission,
    lastReminderAt,
    snoozeUntil,
    remindersToday,
    currentEvent,
    getFocusState,
  ]);

  // Recalculate when dependencies change
  useEffect(() => {
    recalculateNextReminder();
  }, [recalculateNextReminder]);

  // Check if it's time to show reminder
  useEffect(() => {
    if (!nextReminderAt || permission !== "granted" || !settings.notifications_enabled) {
      return;
    }

    const checkReminder = () => {
      const now = new Date();
      
      // Check if it's time
      if (now >= nextReminderAt && now.getTime() - lastReminderTimestampRef.current >= MIN_REMINDER_SPACING_MINUTES * 60 * 1000) {
        showReminder();
      }
    };

    // Check every 30 seconds
    checkIntervalRef.current = setInterval(checkReminder, 30 * 1000);
    
    // Also check immediately
    checkReminder();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [nextReminderAt, permission, settings.notifications_enabled]);

  // Show reminder notification
  const showReminder = useCallback(() => {
    if (permission !== "granted" || !("Notification" in window)) {
      return;
    }

    const now = new Date();
    
    // Build context-aware message
    const reminderState = {
      isIdle: currentEvent?.isIdle || false,
      lastLogTime: logsSummary?.lastLogTime ? new Date(logsSummary.lastLogTime) : null,
      recentContextSwitch: false, // TODO: Track from context changes
      logsTodayCount: logsSummary?.logsTodayCount || 0,
      idleDurationMinutes: currentEvent?.isIdle ? 3 : 0, // Approximate
    };

    const message = buildReminderMessage(reminderState);

    const notification = new Notification(message.title, {
      body: message.body,
      icon: "/favicon.ico",
      tag: "dayflow-reminder",
      requireInteraction: false,
      data: {
        type: "reminder",
        lastActivity: logsSummary?.lastActivity || null,
        lastCategoryId: logsSummary?.lastCategory || null,
      },
    });

    notification.onclick = () => {
      window.focus();
      
      // Trigger quick log modal via custom event
      const event = new CustomEvent("dayflow:openQuickLog", {
        detail: {
          activity: logsSummary?.lastActivity || "",
          categoryId: logsSummary?.lastCategory || null,
        },
      });
      window.dispatchEvent(event);
      
      notification.close();
      setDismissalsCount(0); // Reset dismissals on click
    };

    // Track dismissal
    const handleClose = () => {
      setDismissalsCount((prev) => {
        const newCount = prev + 1;
        // Auto-snooze after 3 dismissals
        if (newCount >= AUTO_SNOOZE_AFTER_DISMISSALS) {
          const snoozeUntil = new Date(now.getTime() + AUTO_SNOOZE_DURATION_MINUTES * 60 * 1000);
          setSnoozeUntil(snoozeUntil);
          setDismissalsCount(0);
        }
        return newCount;
      });
    };

    notification.addEventListener("close", handleClose);

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
      handleClose();
    }, 10000);

    // Update state
    setLastReminderAt(now);
    lastReminderTimestampRef.current = now.getTime();
    setRemindersToday((prev) => prev + 1);
    recalculateNextReminder();
  }, [permission, currentEvent, logsSummary, recalculateNextReminder]);

  // Reset daily counter at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const resetTimer = setTimeout(() => {
      setRemindersToday(0);
      setDismissalsCount(0);
    }, msUntilMidnight);

    return () => clearTimeout(resetTimer);
  }, []);

  // Expose activity change handler for ActivityMonitorWrapper
  useEffect(() => {
    // Store handler on window for ActivityMonitorWrapper to call
    if (typeof window !== "undefined") {
      (window as any).__reminderClientHandleActivity = handleActivityChange;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__reminderClientHandleActivity;
      }
    };
  }, [handleActivityChange]);

  // Also use callback if provided
  useEffect(() => {
    if (onActivityHandlerReady) {
      onActivityHandlerReady(handleActivityChange);
    }
  }, [handleActivityChange, onActivityHandlerReady]);

  return (
    <>
      {showBanner && permission === "denied" && (
        <InlineReminderBanner
          onEnable={() => {
            setPermission(Notification.permission);
            setShowBanner(false);
          }}
          onDismiss={() => setShowBanner(false)}
        />
      )}
    </>
  );
}
