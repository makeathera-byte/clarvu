"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertCircle } from "lucide-react";

interface NotificationPermissionPromptProps {
  triggerPrompt?: boolean; // Allow external trigger
}

export function NotificationPermissionPrompt({ triggerPrompt = false }: NotificationPermissionPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeclinedInfo, setShowDeclinedInfo] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return; // Notifications not supported
    }

    let timer: NodeJS.Timeout | null = null;

    const checkPermission = () => {
      const permission = Notification.permission;
      setPermissionStatus(permission);

      // Check if user has previously declined
      const hasDeclinedPrompt = localStorage.getItem("notification-permission-declined");
      const hasShownPrompt = sessionStorage.getItem("notification-prompt-shown");
      
      // Only show prompt if:
      // 1. Permission is default (not yet asked) OR denied (blocked)
      // 2. User hasn't previously declined
      // 3. We haven't shown the prompt in this session
      // 4. Prompt is not already showing
      if ((permission === "default" || permission === "denied") && 
          !hasDeclinedPrompt && 
          !hasShownPrompt && 
          !showPrompt) {
        // Clear any existing timer
        if (timer) {
          clearTimeout(timer);
        }
        
        // Small delay to avoid showing immediately on page load
        timer = setTimeout(() => {
          setShowPrompt(true);
          sessionStorage.setItem("notification-prompt-shown", "true");
        }, 2000); // Show after 2 seconds
      }
    };

    // Check immediately
    checkPermission();

    // Listen for permission changes
    const interval = setInterval(checkPermission, 5000); // Check every 5 seconds
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      clearInterval(interval);
    };
  }, [showPrompt]);

  // Allow external trigger via custom event
  useEffect(() => {
    const handleRequestPermission = () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = Notification.permission;
        if (permission === "default" || permission === "denied") {
          setShowPrompt(true);
          sessionStorage.removeItem("notification-prompt-shown"); // Reset so it can show
        }
      }
    };

    window.addEventListener("request-notification-permission", handleRequestPermission);
    return () => {
      window.removeEventListener("request-notification-permission", handleRequestPermission);
    };
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setShowPrompt(false);
      
      if (permission === "granted") {
        // Clear declined flag if it was set
        localStorage.removeItem("notification-permission-declined");
        
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
        // User denied, show declined info
        localStorage.setItem("notification-permission-declined", "true");
        setShowDeclinedInfo(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setShowDeclinedInfo(true);
    }
  };

  const handleDecline = () => {
    localStorage.setItem("notification-permission-declined", "true");
    sessionStorage.setItem("notification-prompt-shown", "true");
    setShowPrompt(false);
    setShowDeclinedInfo(true);
  };

  const handleCloseDeclinedInfo = () => {
    setShowDeclinedInfo(false);
  };

  // Don't show if permission is already granted
  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <>
      {/* Initial Permission Prompt */}
      <Dialog open={showPrompt} onOpenChange={(open) => {
        setShowPrompt(open);
        if (!open) {
          // If dialog is closed without enabling, mark as shown
          sessionStorage.setItem("notification-prompt-shown", "true");
        }
      }}>
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
              This helps you stay updated on your productivity insights.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You'll receive notifications for:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Daily AI summaries when ready</li>
              <li>Weekly insights and patterns</li>
              <li>Monthly productivity reports</li>
              <li>Activity reminders (if enabled)</li>
            </ul>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="w-full sm:w-auto"
            >
              I don't want to
            </Button>
            <Button
              onClick={handleEnable}
              className="w-full sm:w-auto"
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
                <BellOff className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Real-time alerts</strong> when AI summaries are generated</span>
              </li>
              <li className="flex items-start gap-2">
                <BellOff className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Activity reminders</strong> to help you stay on track</span>
              </li>
              <li className="flex items-start gap-2">
                <BellOff className="h-4 w-4 mt-0.5 text-destructive" />
                <span><strong>Weekly insights</strong> delivered to your device</span>
              </li>
              <li className="flex items-start gap-2">
                <BellOff className="h-4 w-4 mt-0.5 text-destructive" />
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
            <Button onClick={handleCloseDeclinedInfo} className="w-full sm:w-auto">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

