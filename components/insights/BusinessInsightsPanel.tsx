"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessInsights {
  revenueTime: {
    total_revenue_minutes: number;
    percentage_of_day_spent_on_revenue_work: number;
  };
  adminTime: {
    total_admin_minutes: number;
    admin_ratio: number;
  };
  contextSwitches: number;
  highImpactTasks: Array<{
    id: string;
    activity: string;
    start_time: string;
    end_time: string | null;
    categories?: { name: string } | null;
  }>;
  roiScore: {
    average_daily_roi_score: number;
    roi_score_trend: number;
  };
}

interface BusinessInsightsPanelProps {
  insights: BusinessInsights | null;
}

export function BusinessInsightsPanel({ insights }: BusinessInsightsPanelProps) {
  if (!insights) {
    return (
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              Start logging activities to see business insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimeOfDay = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTaskDuration = (start: string, end: string | null) => {
    if (!end) return 0;
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return Math.floor((endTime - startTime) / (1000 * 60));
  };

  const getROIScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-blue-600 dark:text-blue-400";
    if (score >= 25) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getROIScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-50 dark:bg-green-950/30";
    if (score >= 50) return "bg-blue-50 dark:bg-blue-950/30";
    if (score >= 25) return "bg-yellow-50 dark:bg-yellow-950/30";
    return "bg-red-50 dark:bg-red-950/30";
  };

  return (
    <div className="space-y-6">
      {/* Revenue Time Card */}
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {formatTime(insights.revenueTime.total_revenue_minutes)}
              </span>
              <span className="text-lg text-muted-foreground">
                on revenue work
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {insights.revenueTime.percentage_of_day_spent_on_revenue_work}% of your day
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Time Card */}
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Admin Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {formatTime(insights.adminTime.total_admin_minutes)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {insights.adminTime.admin_ratio}% of work time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Context Switching Card */}
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Context Switching</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {insights.contextSwitches}
              </span>
              <span className="text-lg text-muted-foreground">
                task switches today
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {insights.contextSwitches < 5
                ? "Great focus! Minimal context switching."
                : insights.contextSwitches < 10
                ? "Moderate switching. Consider batching similar tasks."
                : "High context switching. Focus on task batching."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ROI Score Card */}
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Task ROI Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`rounded-xl border border-border/40 ${getROIScoreBgColor(
              insights.roiScore.average_daily_roi_score
            )} p-6`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Daily Average
              </span>
              <span
                className={`text-4xl font-bold ${getROIScoreColor(
                  insights.roiScore.average_daily_roi_score
                )}`}
              >
                {insights.roiScore.average_daily_roi_score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.roiScore.roi_score_trend > 0
                ? "↗ Trending up"
                : insights.roiScore.roi_score_trend < 0
                ? "↘ Trending down"
                : "→ Stable"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* High Impact Tasks */}
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">High Impact Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.highImpactTasks.length > 0 ? (
            <div className="space-y-3">
              {insights.highImpactTasks.map((task) => {
                const duration = calculateTaskDuration(task.start_time, task.end_time);
                return (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border/40 bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground flex-1">
                        {task.activity}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeOfDay(task.start_time)}
                      </span>
                      {task.categories?.name && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {task.categories.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No high-impact tasks detected today.
              <br />
              <span className="text-xs text-muted-foreground/70">
                High-impact tasks are revenue work lasting 45+ minutes during peak hours (10am-1pm).
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

