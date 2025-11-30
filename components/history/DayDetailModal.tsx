"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLog, DailySummary } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { CategoryPieChart } from "./charts/CategoryPieChart";
import { TimeDistributionBarChart } from "./charts/TimeDistributionBarChart";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { compareTodayToYesterday } from "@/lib/insights/comparisons";

interface DayDetailModalProps {
  date: string;
  logs: ActivityLog[];
  summary: DailySummary | null;
  previousLogs?: ActivityLog[];
  previousSummary?: DailySummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DayDetailModal({
  date,
  logs,
  summary,
  previousLogs = [],
  previousSummary = null,
  open,
  onOpenChange,
}: DayDetailModalProps) {
  const dateObj = parseISO(date);
  const comparison = useMemo(() => {
    if (!previousLogs || previousLogs.length === 0) return null;
    return compareTodayToYesterday(logs, previousLogs, summary, previousSummary);
  }, [logs, previousLogs, summary, previousSummary]);

  const dayStats = useMemo(() => {
    let totalMinutes = 0;
    let revenueMinutes = 0;
    let adminMinutes = 0;
    let breakMinutes = 0;
    const categoryBreakdown = new Map<
      string,
      { name: string; minutes: number; color: string }
    >();

    logs.forEach((log) => {
      if (!log.start_time || !log.end_time) return;
      const duration = calculateDurationMinutes(log.start_time, log.end_time);
      if (duration <= 0) return;

      totalMinutes += duration;

      const categoryName = log.categories?.name || "Uncategorized";
      const categoryColor = log.categories?.color || "#8884d8";
      const categoryId = log.categories?.id || "uncategorized";
      const businessType = log.categories?.business_type;

      if (businessType === "revenue") {
        revenueMinutes += duration;
      } else if (businessType === "admin") {
        adminMinutes += duration;
      } else if (businessType === "break") {
        breakMinutes += duration;
      }

      if (categoryBreakdown.has(categoryId)) {
        const existing = categoryBreakdown.get(categoryId)!;
        existing.minutes += duration;
      } else {
        categoryBreakdown.set(categoryId, {
          name: categoryName,
          minutes: duration,
          color: categoryColor,
        });
      }
    });

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      revenueHours: Math.round((revenueMinutes / 60) * 10) / 10,
      adminHours: Math.round((adminMinutes / 60) * 10) / 10,
      breakHours: Math.round((breakMinutes / 60) * 10) / 10,
      categoryBreakdown: Array.from(categoryBreakdown.values()).map((cat) => ({
        ...cat,
        hours: Math.round((cat.minutes / 60) * 10) / 10,
      })),
    };
  }, [logs]);

  const getTrendIcon = (delta: number | null) => {
    if (delta === null || delta === 0) return <Minus className="h-3 w-3" />;
    if (delta > 0) return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
    return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {format(dateObj, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of your productivity for this day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground mb-1">Focus Score</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold">
                    {summary?.focus_score ? `${Math.round(summary.focus_score)}%` : "N/A"}
                  </div>
                  {comparison?.focusScoreChange !== null && comparison.focusScoreChange !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(comparison.focusScoreChange)}
                      <span
                        className={cn(
                          comparison.focusScoreChange > 0
                            ? "text-green-600 dark:text-green-400"
                            : comparison.focusScoreChange < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {comparison.focusScoreChange > 0 ? "+" : ""}
                        {Math.round(comparison.focusScoreChange)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground mb-1">Total Time</div>
                <div className="text-2xl font-semibold">{dayStats.totalHours}h</div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground mb-1">Revenue Time</div>
                <div className="text-2xl font-semibold">{dayStats.revenueHours}h</div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground mb-1">Activities</div>
                <div className="text-2xl font-semibold">{logs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryPieChart
              logs={logs}
              title="Category Distribution"
              description="Time spent by category"
            />
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Hourly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayStats.categoryBreakdown
                    .sort((a, b) => b.minutes - a.minutes)
                    .map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <span className="text-sm font-medium">{cat.hours}h</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary */}
          {summary?.summary && (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Logs */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activities logged for this day
                  </p>
                ) : (
                  logs.map((log, index) => {
                    const duration = log.start_time && log.end_time
                      ? calculateDurationMinutes(log.start_time, log.end_time)
                      : 0;
                    const startTime = log.start_time
                      ? format(parseISO(log.start_time), "h:mm a")
                      : "";
                    const endTime = log.end_time
                      ? format(parseISO(log.end_time), "h:mm a")
                      : "";

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border/40"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: log.categories?.color || "#8884d8",
                              }}
                            />
                            <span className="text-sm font-medium">{log.activity}</span>
                            {log.categories && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: log.categories.color,
                                  color: log.categories.color,
                                }}
                              >
                                {log.categories.name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {startTime} - {endTime} ({Math.round(duration)} min)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

