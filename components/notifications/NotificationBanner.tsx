"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const checkPermission = () => {
      const permission = Notification.permission;
      setPermissionStatus(permission);
      
      // Show banner if permission is denied or default (not granted)
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
      
      if (permission === "granted") {
        setShowBanner(false);
        localStorage.removeItem("notification-banner-dismissed");
        
        // Show a test notification
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
        // User denied - keep banner visible
        localStorage.setItem("notification-permission-declined", "true");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  if (!showBanner || permissionStatus === "granted") {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Enable Browser Notifications
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Get notified when your AI summaries are ready and receive activity reminders.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!("Notification" in window)) {
                    alert("Notifications are not supported in this browser.");
                    return;
                  }

                  const currentPermission = Notification.permission;
                  
                  if (currentPermission === "denied") {
                    alert("Notifications are blocked. Please enable them in your browser settings.");
                    return;
                  }

                  if (currentPermission === "granted") {
                    setShowBanner(false);
                    localStorage.removeItem("notification-banner-dismissed");
                    return;
                  }

                  // Call requestPermission directly in click handler
                  Notification.requestPermission()
                    .then((permission) => {
                      setPermissionStatus(permission);
                      
                      if (permission === "granted") {
                        setShowBanner(false);
                        localStorage.removeItem("notification-banner-dismissed");
                        
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
                        localStorage.setItem("notification-permission-declined", "true");
                      }
                    })
                    .catch((error) => {
                      console.error("Error requesting notification permission:", error);
                    });
                }}
                className="rounded-lg h-8 text-xs"
                type="button"
              >
                <Bell className="h-3 w-3 mr-1" />
                Enable Notifications
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

