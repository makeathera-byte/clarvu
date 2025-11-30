"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

type SummaryType = "daily" | "weekly" | "monthly";

/**
 * Client component that periodically checks for new AI summaries
 * and shows notifications when they're ready
 */
export function SummaryCheckClient() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [summaryType, setSummaryType] = useState<SummaryType>("daily");
  const [summaryDate, setSummaryDate] = useState<string>("");

  useEffect(() => {
    // Check for new summaries every 5 minutes
    const checkForNewSummary = async () => {
      try {
        // Check daily summary
        const dailyResponse = await fetch("/api/notifications/summary-ready?type=daily");
        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          if (dailyData.success && dailyData.data?.isNew && dailyData.data?.hasSummary) {
            const notificationKey = `summary-check-daily-${dailyData.data.date}`;
            if (!localStorage.getItem(notificationKey)) {
              setShowNotification(true);
              setSummaryType("daily");
              setSummaryDate(dailyData.data.date);
              localStorage.setItem(notificationKey, "shown");
              showBrowserNotification("Daily", dailyData.data.date);
              return;
            }
          }
        }

        // Check weekly summary
        const weeklyResponse = await fetch("/api/notifications/summary-ready?type=weekly");
        if (weeklyResponse.ok) {
          const weeklyData = await weeklyResponse.json();
          if (weeklyData.success && weeklyData.data?.isNew && weeklyData.data?.hasSummary) {
            const notificationKey = `summary-check-weekly-${weeklyData.data.date}`;
            if (!localStorage.getItem(notificationKey)) {
              setShowNotification(true);
              setSummaryType("weekly");
              setSummaryDate(weeklyData.data.date);
              localStorage.setItem(notificationKey, "shown");
              showBrowserNotification("Weekly", weeklyData.data.date);
              return;
            }
          }
        }

        // Check monthly summary
        const monthlyResponse = await fetch("/api/notifications/summary-ready?type=monthly");
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          if (monthlyData.success && monthlyData.data?.isNew && monthlyData.data?.hasSummary) {
            const notificationKey = `summary-check-monthly-${monthlyData.data.date}`;
            if (!localStorage.getItem(notificationKey)) {
              setShowNotification(true);
              setSummaryType("monthly");
              setSummaryDate(monthlyData.data.date);
              localStorage.setItem(notificationKey, "shown");
              showBrowserNotification("Monthly", monthlyData.data.date);
              return;
            }
          }
        }
      } catch (error) {
        // Silently fail - don't spam errors
        console.error("Error checking for new summary:", error);
      }
    };

    const showBrowserNotification = (type: string, date: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification(`DayFlow ${type} Summary Ready!`, {
            body: `Your ${type.toLowerCase()} insights are waiting for you on the dashboard.`,
            icon: "/favicon.ico",
            tag: `ai-summary-ready-${type.toLowerCase()}`,
          });

          notification.onclick = () => {
            window.focus();
            router.push(`/dashboard#${type === "daily" ? "daily" : type === "weekly" ? "weekly" : "monthly"}`);
            notification.close();
          };
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }
    };

    // Check immediately on mount
    checkForNewSummary();

    // Then check every 5 minutes
    const interval = setInterval(checkForNewSummary, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  if (!showNotification || notificationDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setNotificationDismissed(true);
    setShowNotification(false);
  };

  const handleView = () => {
    const tab = summaryType === "daily" ? "daily" : summaryType === "weekly" ? "weekly" : "monthly";
    router.push(`/dashboard#${tab}`);
    handleDismiss();
  };

  const typeLabel = summaryType === "daily" ? "Daily" : summaryType === "weekly" ? "Weekly" : "Monthly";

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Your {typeLabel} AI Summary is Ready!
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Your {typeLabel.toLowerCase()} AI summary has been generated. Check it out in the {typeLabel} tab.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleView}
                className="rounded-lg h-8 text-xs"
              >
                View Summary
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="rounded-lg h-8 text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
