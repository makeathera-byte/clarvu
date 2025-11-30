"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeriodComparisonProps {
  currentPeriodLogs: ActivityLog[];
  previousPeriodLogs: ActivityLog[];
  currentLabel: string;
  previousLabel: string;
}

export function PeriodComparison({
  currentPeriodLogs,
  previousPeriodLogs,
  currentLabel,
  previousLabel,
}: PeriodComparisonProps) {
  const metrics = useMemo(() => {
    const calculateMetrics = (logs: ActivityLog[]) => {
      let totalMinutes = 0;
      let revenueMinutes = 0;
      let adminMinutes = 0;
      const categoryMap = new Map<string, number>();

      logs.forEach((log) => {
        if (!log.start_time || !log.end_time) return;
        const duration = calculateDurationMinutes(log.start_time, log.end_time);
        if (duration <= 0) return;

        totalMinutes += duration;

        const businessType = log.categories?.business_type;
        if (businessType === "revenue") {
          revenueMinutes += duration;
        } else if (businessType === "admin") {
          adminMinutes += duration;
        }

        const categoryName = log.categories?.name || "Uncategorized";
        categoryMap.set(
          categoryName,
          (categoryMap.get(categoryName) || 0) + duration
        );
      });

      return {
        totalHours: totalMinutes / 60,
        revenueHours: revenueMinutes / 60,
        adminHours: adminMinutes / 60,
        activityCount: logs.length,
        categoryCount: categoryMap.size,
      };
    };

    const current = calculateMetrics(currentPeriodLogs);
    const previous = calculateMetrics(previousPeriodLogs);

    return {
      current,
      previous,
      changes: {
        totalHours: current.totalHours - previous.totalHours,
        revenueHours: current.revenueHours - previous.revenueHours,
        adminHours: current.adminHours - previous.adminHours,
        activityCount: current.activityCount - previous.activityCount,
      },
    };
  }, [currentPeriodLogs, previousPeriodLogs]);

  const getTrendIcon = (value: number) => {
    if (value > 0.1) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (value < -0.1) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatHours = (hours: number) => {
    return `${hours >= 0 ? "+" : ""}${hours.toFixed(1)}h`;
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Period Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Period */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{currentLabel}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Time</span>
                <span className="text-sm font-medium">{metrics.current.totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue Time</span>
                <span className="text-sm font-medium">{metrics.current.revenueHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activities</span>
                <span className="text-sm font-medium">{metrics.current.activityCount}</span>
              </div>
            </div>
          </div>

          {/* Previous Period */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{previousLabel}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Time</span>
                <span className="text-sm font-medium">{metrics.previous.totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue Time</span>
                <span className="text-sm font-medium">{metrics.previous.revenueHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activities</span>
                <span className="text-sm font-medium">{metrics.previous.activityCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changes */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Changes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Time</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.changes.totalHours)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    metrics.changes.totalHours > 0.1
                      ? "text-green-600 dark:text-green-400"
                      : metrics.changes.totalHours < -0.1
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {formatHours(metrics.changes.totalHours)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revenue Time</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.changes.revenueHours)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    metrics.changes.revenueHours > 0.1
                      ? "text-green-600 dark:text-green-400"
                      : metrics.changes.revenueHours < -0.1
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {formatHours(metrics.changes.revenueHours)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Activity Count</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.changes.activityCount)}
                <span
                  className={cn(
                    "text-sm font-medium",
                    metrics.changes.activityCount > 0
                      ? "text-green-600 dark:text-green-400"
                      : metrics.changes.activityCount < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {metrics.changes.activityCount >= 0 ? "+" : ""}
                  {metrics.changes.activityCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

