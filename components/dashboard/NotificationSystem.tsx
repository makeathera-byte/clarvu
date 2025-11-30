"use client";

import { useState, useEffect } from "react";
import { ReminderClient } from "@/components/notifications/ReminderClient";
import { IntervalReminderClient } from "@/components/notifications/IntervalReminderClient";
import { ActivityMonitorWrapper, ActivityEvent } from "@/components/monitor/ActivityMonitorWrapper";
import { QuickLogModal } from "@/components/activity/QuickLogModal";
import { SummaryCheckClient } from "@/components/notifications/SummaryCheckClient";

interface ReminderSettings {
  notifications_enabled: boolean;
  smart_reminders_enabled: boolean;
  min_reminder_interval_minutes: number;
  max_reminder_interval_minutes: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  reminder_interval?: number;
}

interface NotificationSystemProps {
  initialSettings: ReminderSettings;
}

/**
 * Client Component that wraps ReminderClient and ActivityMonitorWrapper
 * Handles the connection between activity monitoring and reminders
 * Also manages QuickLogModal for notification-based logging
 */
export function NotificationSystem({ initialSettings }: NotificationSystemProps) {
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogActivity, setQuickLogActivity] = useState("");
  const [quickLogCategoryId, setQuickLogCategoryId] = useState<string | null>(null);
  const [logsSummary, setLogsSummary] = useState<any>(null);

  // Fetch logs summary periodically for interval reminders
  useEffect(() => {
    const fetchLogsSummary = async () => {
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
    };

    // Fetch immediately
    fetchLogsSummary();

    // Refresh every 5 minutes
    const interval = setInterval(fetchLogsSummary, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for quick log events from notifications
  useEffect(() => {
    const handleQuickLog = (e: CustomEvent) => {
      setQuickLogActivity(e.detail.activity || "");
      setQuickLogCategoryId(e.detail.categoryId || null);
      setQuickLogOpen(true);
    };

    window.addEventListener("dayflow:openQuickLog", handleQuickLog as EventListener);

    return () => {
      window.removeEventListener("dayflow:openQuickLog", handleQuickLog as EventListener);
    };
  }, []);

  const handleActivityChange = (event: ActivityEvent) => {
    // Forward activity events to ReminderClient via window global
    if (typeof window !== "undefined") {
      const handler = (window as any).__reminderClientHandleActivity;
      if (handler && typeof handler === "function") {
        handler(event);
      }
    }
  };

  return (
    <>
      <ReminderClient initialSettings={initialSettings} />
      {/* Interval-based reminders using reminder_interval from settings */}
      <IntervalReminderClient
        settings={{
          notifications_enabled: initialSettings.notifications_enabled,
          reminder_interval_minutes: initialSettings.reminder_interval || 30,
        }}
        logsSummary={logsSummary}
      />
      <ActivityMonitorWrapper
        enabled={true}
        onContextChange={handleActivityChange}
      />
      <QuickLogModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        initialActivity={quickLogActivity}
        initialCategoryId={quickLogCategoryId}
      />
      <SummaryCheckClient />
    </>
  );
}
