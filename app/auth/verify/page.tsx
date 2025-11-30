"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Email verification page
 * Polls for email verification and redirects when confirmed
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let checkCount = 0;
    const maxChecks = 60; // Check for up to 5 minutes (5s * 60)

    const checkVerification = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error checking verification:", error);
          return;
        }

        if (user && user.email_confirmed_at) {
          setIsVerified(true);
          setIsChecking(false);
          clearInterval(pollInterval);

          // Show browser notification if permission granted
          if ("Notification" in window && Notification.permission === "granted" && !notificationSent) {
            try {
              await new Notification("Email Verified", {
                body: "Your email is verified. You're all set to use DayFlow!",
                icon: "/favicon.ico",
                tag: "email-verified",
              });
              setNotificationSent(true);
            } catch (notifError) {
              console.error("Error showing notification:", notifError);
            }
          }

          // Redirect after short delay
          setTimeout(() => {
            router.push("/dashboard?verified=true");
          }, 1500);
          return;
        }

        checkCount++;
        if (checkCount >= maxChecks) {
          setIsChecking(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Verification check error:", err);
        setIsChecking(false);
        clearInterval(pollInterval);
      }
    };

    // Check immediately
    checkVerification();

    // Then poll every 5 seconds
    pollInterval = setInterval(checkVerification, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [router, notificationSent]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full border-border/40 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isVerified ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Mail className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold">
            {isVerified ? "Email Verified!" : "Check Your Email"}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? "Redirecting you to the dashboard..."
              : "We sent a verification link to your email address. Please click it to verify your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isChecking && !isVerified && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for verification...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This page will automatically update when you verify your email.
              </p>
            </div>
          )}
          {!isChecking && !isVerified && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Haven't received the email? Check your spam folder or try signing up again.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signup")}
                className="w-full"
              >
                Back to Sign Up
              </Button>
            </div>
          )}
          {isVerified && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your email has been verified!</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

