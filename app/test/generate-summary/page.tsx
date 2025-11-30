"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateSummaryPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);

  const generateSummary = async () => {
    setStatus("generating");
    setMessage("Generating AI summary...");

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Summary generated successfully!");
        setSummary(data.data?.summary);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to generate summary");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "An error occurred");
    }
  };

  useEffect(() => {
    // Auto-generate on page load
    generateSummary();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full border-border/40 shadow-sm rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Generating AI Summary</CardTitle>
          <CardDescription>
            {status === "idle" && "Click the button below to generate your AI summary"}
            {status === "generating" && "Analyzing your activities and generating insights..."}
            {status === "success" && "Summary generated successfully! Redirecting to dashboard..."}
            {status === "error" && "An error occurred while generating the summary"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "generating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-sm text-green-600 dark:text-green-400">{message}</p>
              {summary && (
                <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium">Focus Score: {summary.focus_score || "N/A"}</p>
                  <p className="mt-2 text-muted-foreground">Date: {summary.date}</p>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-sm text-destructive">{message}</p>
              <Button
                onClick={generateSummary}
                className="mt-4 rounded-xl"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {status === "idle" && (
            <Button
              onClick={generateSummary}
              className="w-full rounded-xl"
              size="lg"
            >
              Generate Summary Now
            </Button>
          )}

          <div className="pt-4 border-t border-border/40">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="w-full rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

