"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateAISummaryTime } from "@/app/settings/reminderActions";
import { Loader2 } from "lucide-react";

interface AISummarySettingsFormProps {
  initialTime: string | null; // "HH:mm" format or null
}

/**
 * AI Summary Time Settings Form
 * Allows users to set when their daily AI summary should be generated
 */
export function AISummarySettingsForm({ initialTime }: AISummarySettingsFormProps) {
  const [summaryTime, setSummaryTime] = useState(initialTime || "22:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    
    try {
      const result = await updateAISummaryTime(summaryTime);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Failed to save AI summary time:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>AI Summary Settings</CardTitle>
        <CardDescription>
          Configure when your daily AI summary should be generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-summary-time">Daily Summary Time</Label>
          <Input
            id="ai-summary-time"
            type="time"
            value={summaryTime}
            onChange={(e) => setSummaryTime(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Your daily AI summary will be generated at this time each day. Default: 10:00 PM
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div>
            {saved && (
              <p className="text-xs text-green-600 dark:text-green-400">Settings saved!</p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save AI Summary Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

