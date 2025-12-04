import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getTodayLogs, getWeeklyLogs } from "./actions";
import { Timeline } from "@/components/activity/Timeline";
import { NotificationSystem } from "@/components/dashboard/NotificationSystem";
import { ProductivityTips } from "@/components/dashboard/ProductivityTips";
import { getUserSettings } from "@/app/settings/actions";
import { getLatestSummaries, getYesterdaySummary } from "./aiActions";
import { getBusinessInsights } from "./businessActions";
import { getCachedRoutine } from "./routineActions";
import { DashboardTabs } from "./DashboardTabs";
import { getUserDisplayName } from "@/lib/utils/user";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { getBusinessType, inferBusinessType } from "@/lib/utils/categories";
import { SummaryReadyNotification } from "@/components/notifications/SummaryReadyNotification";
import { NotificationPermissionPrompt } from "@/components/notifications/NotificationPermissionPrompt";
import { NotificationBanner } from "@/components/notifications/NotificationBanner";
import { MidnightRefresh } from "@/components/dashboard/MidnightRefresh";
import { CountryNotification } from "@/components/dashboard/CountryNotification";
import { TasksSection } from "@/components/dashboard/TasksSection";
import type { ActivityLog } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const logsResult = await getTodayLogs();
  const weeklyLogsResult = await getWeeklyLogs();
  const settingsResult = await getUserSettings();
  const summariesResult = await getLatestSummaries();
  const yesterdaySummaryResult = await getYesterdaySummary();
  const businessInsightsResult = await getBusinessInsights();
  const routineResult = await getCachedRoutine();
  const logs = logsResult.logs || [];
  const weeklyLogs = weeklyLogsResult.logs || [];
  
  // Calculate today's metrics for comparison
  const todayRevenueMinutes = logs.reduce((total: number, log: ActivityLog) => {
    if (!log.start_time || !log.end_time) return total;
    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    if (businessType === "revenue") {
      return total + calculateDurationMinutes(log.start_time, log.end_time);
    }
    return total;
  }, 0);

  const todayContextSwitches = Math.max(0, logs.length - 1);

  // Get user's timezone and country for yesterday calculation
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("timezone, country")
    .eq("user_id", user.id)
    .maybeSingle();
  
  const userTimezone = userSettings?.timezone || "UTC";
  const userCountry = userSettings?.country || null;
  const { getYesterdayRangeUTC } = await import("@/lib/utils/date-timezone");
  const { start: yesterdayStart, end: yesterdayEnd } = getYesterdayRangeUTC(userTimezone);

  const { data: yesterdayLogs } = await supabase
    .from("activity_logs")
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon,
        business_type
      )
    `)
    .eq("user_id", user.id)
    .gte("start_time", yesterdayStart.toISOString())
    .lt("start_time", yesterdayEnd.toISOString());

  const yesterdayRevenueMinutes = (yesterdayLogs || []).reduce((total: number, log: ActivityLog) => {
    if (!log.start_time || !log.end_time) return total;
    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    if (businessType === "revenue") {
      return total + calculateDurationMinutes(log.start_time, log.end_time);
    }
    return total;
  }, 0);

  const yesterdayContextSwitches = Math.max(0, (yesterdayLogs || []).length - 1);
  const settings = settingsResult.settings || {
    reminder_interval: 30,
    notifications_enabled: true,
    smart_reminders_enabled: true,
    min_reminder_interval_minutes: 20,
    max_reminder_interval_minutes: 45,
    quiet_hours_start: null,
    quiet_hours_end: null,
  };
  
  // Show errors if database tables don't exist
  const hasDatabaseError = logsResult.error || settingsResult.error;
  
  // Combine logs for charts (use weekly logs for heatmap, today's logs for daily view)
  const allLogsForCharts = [...logs, ...weeklyLogs].filter(
    (log, index, self) =>
      index === self.findIndex((l) => l.id === log.id)
  );

  return (
    <>
      <MidnightRefresh timezone={userTimezone} />
      <NotificationPermissionPrompt />
      <NotificationSystem
        initialSettings={{
          notifications_enabled: settings.notifications_enabled ?? true,
          smart_reminders_enabled: settings.smart_reminders_enabled ?? true,
          min_reminder_interval_minutes: settings.min_reminder_interval_minutes ?? 20,
          max_reminder_interval_minutes: settings.max_reminder_interval_minutes ?? 45,
          quiet_hours_start: settings.quiet_hours_start ?? null,
          quiet_hours_end: settings.quiet_hours_end ?? null,
          reminder_interval: settings.reminder_interval ?? 30,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            DayFlow Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Hello, <span className="font-medium text-foreground">{getUserDisplayName(user)}</span>
          </p>
        </div>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Show notification if country is not selected */}
        <CountryNotification currentCountry={userCountry} />

        {/* Show notification if summary is ready */}
        {summariesResult.daily && (
          <SummaryReadyNotification summaryDate={summariesResult.daily.date} />
        )}

        {/* Tasks Section - Create Task Banner and Today's Tasks */}
        <TasksSection initialTasks={logs.filter((log: ActivityLog) => log.status && (log.status === "pending" || log.status === "in_progress" || log.status === "completed" || log.status === "scheduled"))} />

        {hasDatabaseError && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Database Setup Required
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    The database tables haven't been created yet. Please run the SQL migrations in your Supabase dashboard.
                  </p>
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Quick Fix:</strong>
                    </p>
                    <ol className="text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1 ml-2">
                      <li>Open <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded text-xs font-mono">supabase/complete_schema.sql</code></li>
                      <li>Copy ALL the SQL code</li>
                      <li>Go to <a href="https://supabase.com/dashboard/project/yklexlqvofsxiajmewhy/sql/new" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase SQL Editor</a></li>
                      <li>Paste and click RUN</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    See <code className="bg-yellow-100 dark:bg-yellow-800 px-1.5 py-0.5 rounded text-xs font-mono">RUN_THIS_SQL.md</code> for step-by-step instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Productivity Tips */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <ProductivityTips />
        </div>

        {/* AI Summary Tabs with Charts */}
        <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <DashboardTabs
            logs={allLogsForCharts}
            dailySummary={summariesResult.daily}
            weeklySummary={summariesResult.weekly}
            monthlySummary={summariesResult.monthly}
            businessInsights={businessInsightsResult.insights}
            routineData={routineResult.routine}
            yesterdaySummary={yesterdaySummaryResult.summary}
            todayRevenueMinutes={todayRevenueMinutes}
            yesterdayRevenueMinutes={yesterdayRevenueMinutes}
            todayContextSwitches={todayContextSwitches}
            yesterdayContextSwitches={yesterdayContextSwitches}
            aiSummaryTime={settingsResult.settings?.ai_summary_time || null}
          />
        </div>
      </div>
    </>
  );
}
