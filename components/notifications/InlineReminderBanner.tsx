"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineReminderBannerProps {
  onEnable?: () => void;
  onDismiss?: () => void;
}

/**
 * Inline Reminder Banner
 * Shows when browser notifications are denied/not enabled
 * Provides a way to request permission again
 */
export function InlineReminderBanner({
  onEnable,
  onDismiss,
}: InlineReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (dismissed) {
    return null;
  }

  const handleEnable = async () => {
    if (!("Notification" in window)) {
      return;
    }

    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted" && onEnable) {
        onEnable();
        setDismissed(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Card className="border-border/40 bg-muted/30 rounded-xl shadow-sm animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1">
              Enable notifications
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Get gentle reminders to log your activities throughout the day.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnable}
                disabled={requesting}
                className="rounded-lg text-xs"
              >
                {requesting ? "Requesting..." : "Enable Notifications"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="rounded-lg text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

