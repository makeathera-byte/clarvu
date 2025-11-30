import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserSettings } from "./actions";
import { SettingsForm } from "./settings-form";
import { ReminderSettingsForm } from "@/components/settings/ReminderSettingsForm";
import { AISummarySettingsForm } from "@/components/settings/AISummarySettingsForm";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { ThemeSelector } from "@/components/settings/ThemeSelector";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { settings } = await getUserSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your DayFlow preferences and notification settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Preference */}
        <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <ThemeSelector initialTheme={settings?.theme || "system"} />
        </div>

        {/* Legacy Reminder Settings (for backward compatibility) */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <SettingsForm initialInterval={settings?.reminder_interval || 30} />
        </div>
        
        {/* New Smart Reminder Settings (MARK 10) */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <ReminderSettingsForm
            initialSettings={{
              notifications_enabled: settings?.notifications_enabled ?? true,
              smart_reminders_enabled: settings?.smart_reminders_enabled ?? true,
              min_reminder_interval_minutes: settings?.min_reminder_interval_minutes ?? 20,
              max_reminder_interval_minutes: settings?.max_reminder_interval_minutes ?? 45,
              quiet_hours_start: settings?.quiet_hours_start ?? null,
              quiet_hours_end: settings?.quiet_hours_end ?? null,
              reminder_mode: (settings?.reminder_mode as "low" | "medium" | "high") ?? "medium",
            }}
          />
        </div>
        
        {/* AI Summary Settings (MARK 11) */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <AISummarySettingsForm initialTime={settings?.ai_summary_time || null} />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <CategoryManager />
        </div>
      </div>
    </div>
  );
}
