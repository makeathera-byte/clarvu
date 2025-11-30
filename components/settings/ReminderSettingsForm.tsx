"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateReminderSettings } from "@/app/settings/reminderActions";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReminderSettings {
  notifications_enabled: boolean;
  smart_reminders_enabled: boolean;
  min_reminder_interval_minutes: number;
  max_reminder_interval_minutes: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  reminder_mode: "low" | "medium" | "high";
}

interface ReminderSettingsFormProps {
  initialSettings: Partial<ReminderSettings>;
}

export function ReminderSettingsForm({ initialSettings }: ReminderSettingsFormProps) {
  const [settings, setSettings] = useState<ReminderSettings>({
    notifications_enabled: initialSettings.notifications_enabled ?? true,
    smart_reminders_enabled: initialSettings.smart_reminders_enabled ?? true,
    min_reminder_interval_minutes: initialSettings.min_reminder_interval_minutes ?? 20,
    max_reminder_interval_minutes: initialSettings.max_reminder_interval_minutes ?? 45,
    quiet_hours_start: initialSettings.quiet_hours_start ?? null,
    quiet_hours_end: initialSettings.quiet_hours_end ?? null,
    reminder_mode: initialSettings.reminder_mode ?? "medium",
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update settings when reminder_mode changes
  useEffect(() => {
    const presets = {
      low: { min: 30, max: 60 },
      medium: { min: 20, max: 45 },
      high: { min: 15, max: 30 },
    };
    const preset = presets[settings.reminder_mode];
    if (preset) {
      setSettings((prev) => ({
        ...prev,
        min_reminder_interval_minutes: preset.min,
        max_reminder_interval_minutes: preset.max,
      }));
    }
  }, [settings.reminder_mode]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const result = await updateReminderSettings(settings);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save reminder settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Reminder Behavior</CardTitle>
        <CardDescription>
          Configure how and when DayFlow reminds you to log activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Reminders</Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications to log your activities
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={settings.notifications_enabled}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, notifications_enabled: checked }))
            }
          />
        </div>

        {/* Smart Reminders */}
        {settings.notifications_enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smart-reminders">Smart Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  Adapt reminder frequency based on your activity patterns
                </p>
              </div>
              <Switch
                id="smart-reminders"
                checked={settings.smart_reminders_enabled}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, smart_reminders_enabled: checked }))
                }
                disabled={!settings.notifications_enabled}
              />
            </div>

            {/* Reminder Frequency */}
            <div className="space-y-2">
              <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
              <Select
                value={settings.reminder_mode}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setSettings((prev) => ({ ...prev, reminder_mode: value }))
                }
                disabled={!settings.notifications_enabled}
              >
                <SelectTrigger id="reminder-frequency" className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (30-60 min)</SelectItem>
                  <SelectItem value="medium">Medium (20-45 min)</SelectItem>
                  <SelectItem value="high">High (15-30 min)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.reminder_mode === "low" && "Fewer reminders, less frequent"}
                {settings.reminder_mode === "medium" && "Balanced reminder frequency"}
                {settings.reminder_mode === "high" && "More reminders, stay on track"}
              </p>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-3">
              <Label>Quiet Hours (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Don't show reminders during these hours
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start" className="text-xs">
                    Start Time
                  </Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={settings.quiet_hours_start || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quiet_hours_start: e.target.value || null,
                      }))
                    }
                    disabled={!settings.notifications_enabled}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end" className="text-xs">
                    End Time
                  </Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={settings.quiet_hours_end || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quiet_hours_end: e.target.value || null,
                      }))
                    }
                    disabled={!settings.notifications_enabled}
                    className="rounded-xl"
                  />
                </div>
              </div>
              {(settings.quiet_hours_start || settings.quiet_hours_end) && (
                <p className="text-xs text-muted-foreground">
                  Reminders will be paused between {settings.quiet_hours_start || "..."} and{" "}
                  {settings.quiet_hours_end || "..."}
                </p>
              )}
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div>
            {saved && (
              <p className="text-xs text-green-600 dark:text-green-400">Settings saved!</p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !settings.notifications_enabled}
            className="rounded-xl"
          >
            {saving ? "Saving..." : "Save Reminder Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

