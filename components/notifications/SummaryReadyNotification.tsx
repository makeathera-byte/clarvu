"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface SummaryReadyNotificationProps {
  summaryDate?: string; // Date of the summary that's ready
}

/**
 * Notification banner shown when AI summary is ready
 * Appears on dashboard when user logs in after summary generation
 */
export function SummaryReadyNotification({ summaryDate }: SummaryReadyNotificationProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);

  useEffect(() => {
    // Check localStorage to see if notification was already shown
    const notificationKey = summaryDate 
      ? `summary-notification-${summaryDate}`
      : null;
    
    if (notificationKey && !localStorage.getItem(notificationKey)) {
      setNotificationShown(true);
      
      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("DayFlow AI Summary Ready", {
            body: "Your daily AI summary is ready. Check it out on your dashboard!",
            icon: "/favicon.ico",
            tag: "ai-summary-ready",
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }
    }
  }, [summaryDate]);

  if (dismissed || !notificationShown || !summaryDate) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    const notificationKey = `summary-notification-${summaryDate}`;
    localStorage.setItem(notificationKey, "dismissed");
  };

  const handleView = () => {
    router.push("/dashboard#daily");
    handleDismiss();
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Your AI Summary is Ready!
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Your daily AI summary has been generated. Check it out in the Daily tab.
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

