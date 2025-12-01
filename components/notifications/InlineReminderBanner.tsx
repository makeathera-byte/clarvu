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
                onMouseDown={async (e) => {
                  // Use onMouseDown instead of onClick for better browser compatibility
                  // Don't preventDefault - let the native event flow
                  console.log("🔘 Enable Notifications button pressed");
                  
                  // Check secure context (required for notifications)
                  if (!window.isSecureContext && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
                    alert("Notifications require a secure connection (HTTPS) or localhost. Please access this site via HTTPS.");
                    e.preventDefault();
                    return;
                  }
                  
                  if (!("Notification" in window)) {
                    alert("Notifications are not supported in this browser.");
                    e.preventDefault();
                    return;
                  }

                  const currentPermission = Notification.permission;
                  console.log("📋 Current notification permission:", currentPermission);
                  console.log("🔒 Secure context:", window.isSecureContext);
                  console.log("🌐 Protocol:", window.location.protocol);
                  console.log("🏠 Hostname:", window.location.hostname);
                  
                  // If already denied, show instructions
                  if (currentPermission === "denied") {
                    e.preventDefault();
                    const userAgent = navigator.userAgent.toLowerCase();
                    let instructions = "";
                    
                    if (userAgent.includes("chrome") || userAgent.includes("edge")) {
                      instructions = "Chrome/Edge: Click the lock icon in the address bar → Site settings → Notifications → Allow";
                    } else if (userAgent.includes("firefox")) {
                      instructions = "Firefox: Click the lock icon in the address bar → More Information → Permissions → Notifications → Allow";
                    } else if (userAgent.includes("safari")) {
                      instructions = "Safari: Safari menu → Settings → Websites → Notifications → Allow for this site";
                    } else {
                      instructions = "Go to your browser settings → Site settings → Notifications → Allow for this site";
                    }
                    
                    alert(
                      "Notifications are blocked for this site.\n\n" +
                      "To enable them:\n" + instructions + "\n\n" +
                      "Then refresh this page."
                    );
                    return;
                  }

                  // If already granted, just confirm
                  if (currentPermission === "granted") {
                    e.preventDefault();
                    console.log("✅ Notifications already granted");
                    if (onEnable) {
                      onEnable();
                    }
                    setDismissed(true);
                    return;
                  }

                  // CRITICAL: Call requestPermission IMMEDIATELY - must be in direct response to user gesture
                  // Don't await - call it synchronously and handle the promise
                  console.log("🚀 Calling Notification.requestPermission() IMMEDIATELY - browser dialog should appear NOW...");
                  setRequesting(true);
                  
                  // Call without await to keep it synchronous with the user gesture
                  const permissionPromise = Notification.requestPermission();
                  
                  permissionPromise
                    .then((permission) => {
                      console.log("📱 Browser returned permission:", permission);
                      setRequesting(false);
                      
                      if (permission === "granted") {
                        console.log("✅ Permission granted! Showing test notification...");
                        
                        try {
                          const notification = new Notification("DayFlow Notifications Enabled!", {
                            body: "You'll now receive gentle reminders to log your activities.",
                            icon: "/favicon.ico",
                            tag: "notifications-enabled",
                          });
                          
                          console.log("✅ Test notification shown");
                          
                          setTimeout(() => {
                            notification.close();
                          }, 3000);
                        } catch (notifError) {
                          console.error("❌ Error showing test notification:", notifError);
                        }
                        
                        if (onEnable) {
                          onEnable();
                        }
                        setDismissed(true);
                      } else if (permission === "denied") {
                        console.log("❌ Permission denied by user");
                        alert("Notifications were denied. You can enable them later in your browser settings.");
                      } else {
                        console.log("⚠️ Permission is still 'default' - user may have closed the prompt");
                        // Don't show alert for default - user might try again
                      }
                    })
                    .catch((error: any) => {
                      console.error("❌ Error requesting notification permission:", error);
                      setRequesting(false);
                      
                      // More detailed error message
                      let errorMsg = "Failed to request notification permission.";
                      if (error?.message) {
                        errorMsg += ` Error: ${error.message}`;
                      }
                      if (!window.isSecureContext) {
                        errorMsg += "\n\nNote: Notifications require HTTPS or localhost.";
                      }
                      alert(errorMsg);
                    });
                }}
                onClick={(e) => {
                  // Prevent default click behavior if we're handling it
                  if (requesting) {
                    e.preventDefault();
                  }
                }}
                disabled={requesting}
                className="rounded-lg text-xs"
                type="button"
              >
                <Bell className={cn("h-3 w-3 mr-1", requesting && "animate-pulse")} />
                {requesting ? "Requesting..." : "Enable Notifications"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="rounded-lg text-xs"
                type="button"
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

