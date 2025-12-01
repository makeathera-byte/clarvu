"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDeclinedInfo, setShowDeclinedInfo] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const checkPermission = () => {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      
      // Show banner if permission is denied or default
      if (permission === "denied" || permission === "default") {
        const hasDismissedBanner = localStorage.getItem("notification-banner-dismissed");
        if (!hasDismissedBanner) {
          setShowBanner(true);
        }
      } else {
        setShowBanner(false);
      }
    };

    checkPermission();
    
    // Re-check periodically
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setShowEnableDialog(false);
      
      if (permission === "granted") {
        setShowBanner(false);
        // Show test notification
        new Notification("DayFlow Notifications Enabled!", {
          body: "You'll now receive notifications when your AI summaries are ready.",
          icon: "/favicon.ico",
          tag: "notification-enabled",
        });
      } else {
        setShowDeclinedInfo(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setShowDeclinedInfo(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  const handleDontWant = () => {
    setShowEnableDialog(false);
    setShowDeclinedInfo(true);
  };

  if (!showBanner || permissionStatus === "granted") {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20 animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-2 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                Browser Notifications Disabled
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Enable browser notifications to receive alerts when your AI summaries are ready and get activity reminders.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowEnableDialog(true)}
                  className="rounded-lg h-8 text-xs bg-red-600 hover:bg-red-700"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Enable Notifications
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissBanner}
                  className="rounded-lg h-8 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissBanner}
              className="h-6 w-6 p-0 text-red-600 dark:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enable Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle>Enable Browser Notifications?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              DayFlow can notify you when your AI summaries are ready, even when you're not on the site.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              You'll receive notifications for:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside ml-2">
              <li>Daily AI summaries when ready</li>
              <li>Weekly insights and patterns</li>
              <li>Monthly productivity reports</li>
              <li>Activity reminders (if enabled)</li>
            </ul>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDontWant}
              className="w-full sm:w-auto"
            >
              I don't want to
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!("Notification" in window)) {
                  alert("Notifications are not supported in this browser.");
                  return;
                }

                // Call requestPermission directly in click handler
                Notification.requestPermission()
                  .then((permission) => {
                    setPermissionStatus(permission);
                    setShowEnableDialog(false);
                    
                    if (permission === "granted") {
                      setShowBanner(false);
                      try {
                        new Notification("DayFlow Notifications Enabled!", {
                          body: "You'll now receive notifications when your AI summaries are ready.",
                          icon: "/favicon.ico",
                          tag: "notification-enabled",
                        });
                      } catch (notifError) {
                        console.error("Error showing test notification:", notifError);
                      }
                    } else {
                      setShowDeclinedInfo(true);
                    }
                  })
                  .catch((error) => {
                    console.error("Error requesting notification permission:", error);
                    setShowDeclinedInfo(true);
                  });
              }}
              className="w-full sm:w-auto"
              type="button"
            >
              Enable Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Declined Info Dialog */}
      <Dialog open={showDeclinedInfo} onOpenChange={setShowDeclinedInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle>You're Missing Out on Notifications</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Without browser notifications enabled, you'll miss:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Real-time alerts</strong> when AI summaries are generated</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Activity reminders</strong> to help you stay on track</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Weekly insights</strong> delivered to your device</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Monthly reports</strong> when they're ready</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>To enable later:</strong> Go to your browser settings → Site settings → Notifications, 
                and allow notifications for this site.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDeclinedInfo(false)} className="w-full sm:w-auto">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

