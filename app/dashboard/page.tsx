import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getTodayLogs, getWeeklyLogs } from "./actions";
import { ActivityInput } from "@/components/activity/ActivityInput";
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
  const todayRevenueMinutes = logs.reduce((total, log) => {
    if (!log.start_time || !log.end_time) return total;
    const businessType = log.categories?.business_type || inferBusinessType(log.categories?.name);
    if (businessType === "revenue") {
      return total + calculateDurationMinutes(log.start_time, log.end_time);
    }
    return total;
  }, 0);

  const todayContextSwitches = Math.max(0, logs.length - 1);

  // Fetch yesterday's logs for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

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
    .gte("start_time", yesterday.toISOString())
    .lt("start_time", yesterdayEnd.toISOString());

  const yesterdayRevenueMinutes = (yesterdayLogs || []).reduce((total, log) => {
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

        {/* Show notification if summary is ready */}
        {summariesResult.daily && (
          <SummaryReadyNotification summaryDate={summariesResult.daily.date} />
        )}

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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Activity Input + Productivity Tips */}
          <div className="space-y-6">
            {/* Activity Input */}
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <ActivityInput />
            </div>

            {/* Productivity Tips */}
            <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <ProductivityTips />
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Timeline logs={logs || []} />
          </div>
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
