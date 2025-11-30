"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateReminderInterval } from "./actions";

interface SettingsFormProps {
  initialInterval: number;
}

export function SettingsForm({ initialInterval }: SettingsFormProps) {
  const [interval, setInterval] = useState(initialInterval.toString());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateReminderInterval(parseInt(interval));
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      }
    });
  };

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Reminder Settings</CardTitle>
        <CardDescription>
          Set how often you want to be reminded to log your activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reminder-interval">Reminder Interval</Label>
          <Select value={interval} onValueChange={setInterval} disabled={isPending}>
            <SelectTrigger id="reminder-interval" className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">Every 15 minutes</SelectItem>
              <SelectItem value="30">Every 30 minutes</SelectItem>
              <SelectItem value="60">Every 60 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            You&apos;ll receive a browser notification asking &quot;What are you doing right now?&quot; at this interval.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-xl p-3 text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isPending || interval === initialInterval.toString()}
          className="rounded-xl"
        >
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

