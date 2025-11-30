"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { buildReminderMessage } from "@/lib/reminders/messages";

interface IntervalReminderSettings {
  notifications_enabled: boolean;
  reminder_interval_minutes: number; // User-selected interval (15, 30, 60, etc.)
}

interface IntervalReminderClientProps {
  settings: IntervalReminderSettings;
  logsSummary?: {
    lastLogTime: string | null;
    logsTodayCount: number;
    lastActivity: string | null;
    lastCategoryId: string | null;
  } | null;
}

/**
 * Interval-based reminder client
 * Sends notifications at user-selected intervals (15, 30, 60 minutes, etc.)
 */
export function IntervalReminderClient({
  settings,
  logsSummary,
}: IntervalReminderClientProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [lastReminderAt, setLastReminderAt] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on mount and monitor changes
  useEffect(() => {
    if ("Notification" in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      console.log("[IntervalReminder] Initial permission:", currentPermission);

      if (currentPermission === "default") {
        Notification.requestPermission().then((newPermission) => {
          console.log("[IntervalReminder] Permission request result:", newPermission);
          setPermission(newPermission);
        });
      }
    } else {
      console.warn("[IntervalReminder] Browser does not support notifications");
    }
  }, []);

  // Monitor permission changes
  useEffect(() => {
    const checkPermission = () => {
      if ("Notification" in window) {
        const currentPermission = Notification.permission;
        if (currentPermission !== permission) {
          console.log("[IntervalReminder] Permission changed:", permission, "->", currentPermission);
          setPermission(currentPermission);
        }
      }
    };

    // Check permission periodically (every 30 seconds)
    const permissionCheckInterval = setInterval(checkPermission, 30000);
    
    return () => clearInterval(permissionCheckInterval);
  }, [permission]);

  // Show reminder notification
  const showReminder = useCallback(() => {
    // Check prerequisites
    if (!("Notification" in window)) {
      console.warn("[IntervalReminder] Browser does not support notifications");
      return;
    }

    if (permission !== "granted") {
      console.warn("[IntervalReminder] Notification permission not granted:", permission);
      return;
    }

    if (!settings.notifications_enabled) {
      console.log("[IntervalReminder] Notifications disabled in settings");
      return;
    }

    const reminderState = {
      isIdle: false,
      lastLogTime: logsSummary?.lastLogTime ? new Date(logsSummary.lastLogTime) : null,
      recentContextSwitch: false,
      logsTodayCount: logsSummary?.logsTodayCount || 0,
      idleDurationMinutes: 0,
    };

    const message = buildReminderMessage(reminderState);

    try {
      console.log("[IntervalReminder] Showing notification:", {
        title: message.title,
        body: message.body,
        logsTodayCount: reminderState.logsTodayCount,
        lastLogTime: reminderState.lastLogTime,
      });

      const notification = new Notification(message.title, {
        body: message.body,
        icon: "/favicon.ico",
        tag: "dayflow-interval-reminder",
        requireInteraction: false,
        data: {
          type: "interval-reminder",
          lastActivity: logsSummary?.lastActivity || null,
          categoryId: logsSummary?.lastCategoryId || null,
        },
      });

      notification.onclick = () => {
        window.focus();
        
        // Trigger quick log modal
        const event = new CustomEvent("dayflow:openQuickLog", {
          detail: {
            activity: logsSummary?.lastActivity || "",
            categoryId: logsSummary?.lastCategoryId || null,
          },
        });
        window.dispatchEvent(event);
        
        notification.close();
      };

      notification.onerror = (error) => {
        console.error("[IntervalReminder] Notification error:", error);
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      setLastReminderAt(new Date());
      console.log("[IntervalReminder] Notification shown successfully");
    } catch (error) {
      console.error("[IntervalReminder] Error showing notification:", error);
    }
  }, [permission, settings.notifications_enabled, logsSummary]);

  // Set up interval-based reminders
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!settings.notifications_enabled || !settings.reminder_interval_minutes || permission !== "granted") {
      console.log("[IntervalReminder] Notifications disabled or permission not granted:", {
        notifications_enabled: settings.notifications_enabled,
        reminder_interval_minutes: settings.reminder_interval_minutes,
        permission,
      });
      return;
    }

    // Calculate interval in milliseconds
    const intervalMs = settings.reminder_interval_minutes * 60 * 1000;
    
    console.log("[IntervalReminder] Setting up interval reminders:", {
      interval_minutes: settings.reminder_interval_minutes,
      interval_ms: intervalMs,
      permission,
    });

    // Show first reminder after interval
    const firstReminderTimeout = setTimeout(() => {
      console.log("[IntervalReminder] First reminder triggered");
      showReminder();
    }, intervalMs);

    // Then set up recurring interval
    intervalRef.current = setInterval(() => {
      console.log("[IntervalReminder] Recurring reminder triggered");
      showReminder();
    }, intervalMs);

    return () => {
      clearTimeout(firstReminderTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [settings.notifications_enabled, settings.reminder_interval_minutes, permission, showReminder]);

  return null; // This component doesn't render anything
}

