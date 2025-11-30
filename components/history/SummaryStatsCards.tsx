"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DailySummary, ActivityLog } from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils/time";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Focus,
  Briefcase,
  Coffee,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryStatsCardsProps {
  summaries: DailySummary[];
  logs: ActivityLog[];
  comparison?: {
    focusScoreChange: number | null;
    revenueTimeDelta: number;
    adminTimeDelta: number;
    logsDelta: number;
    deepWorkDelta: number;
    totalTimeDelta: number;
  };
}

export function SummaryStatsCards({
  summaries,
  logs,
  comparison,
}: SummaryStatsCardsProps) {
  const stats = useMemo(() => {
    // Calculate average focus score
    const focusScores = summaries
      .map((s) => s.focus_score)
      .filter((score) => score !== null && score !== undefined) as number[];
    const avgFocusScore =
      focusScores.length > 0
        ? Math.round(
            focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
          )
        : null;

    // Calculate total productive minutes
    let totalMinutes = 0;
    let deepWorkMinutes = 0;
    let adminMinutes = 0;
    let breakMinutes = 0;
    let contextSwitches = 0;

    logs.forEach((log, index) => {
      if (!log.start_time || !log.end_time) return;

      const duration = calculateDurationMinutes(log.start_time, log.end_time);
      if (duration <= 0) return;

      totalMinutes += duration;

      const businessType = log.categories?.business_type;
      if (businessType === "revenue" && duration >= 60) {
        deepWorkMinutes += duration;
      } else if (businessType === "admin") {
        adminMinutes += duration;
      } else if (businessType === "break") {
        breakMinutes += duration;
      }

      // Count context switches (changes in category or activity)
      if (index > 0) {
        const prevLog = logs[index - 1];
        if (
          prevLog.category_id !== log.category_id ||
          prevLog.activity !== log.activity
        ) {
          contextSwitches++;
        }
      }
    });

    const avgContextSwitches = logs.length > 0 ? contextSwitches / logs.length : 0;

    return {
      avgFocusScore,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      deepWorkHours: Math.round((deepWorkMinutes / 60) * 10) / 10,
      adminHours: Math.round((adminMinutes / 60) * 10) / 10,
      breakHours: Math.round((breakMinutes / 60) * 10) / 10,
      avgContextSwitches: Math.round(avgContextSwitches * 10) / 10,
      totalLogs: logs.length,
    };
  }, [summaries, logs]);

  const getTrendIcon = (delta: number | null) => {
    if (delta === null || delta === 0) return <Minus className="h-4 w-4" />;
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  const statCards = [
    {
      title: "Avg Focus Score",
      value: stats.avgFocusScore !== null ? `${stats.avgFocusScore}%` : "N/A",
      icon: Focus,
      trend: comparison?.focusScoreChange,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Time",
      value: `${stats.totalHours}h`,
      icon: Clock,
      trend: comparison?.totalTimeDelta ? comparison.totalTimeDelta / 60 : null,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Deep Work",
      value: `${stats.deepWorkHours}h`,
      icon: Target,
      trend: comparison?.deepWorkDelta ? comparison.deepWorkDelta / 60 : null,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Admin Time",
      value: `${stats.adminHours}h`,
      icon: Briefcase,
      trend: comparison?.adminTimeDelta ? comparison.adminTimeDelta / 60 : null,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Break Time",
      value: `${stats.breakHours}h`,
      icon: Coffee,
      trend: null,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Avg Context Switches",
      value: `${stats.avgContextSwitches}`,
      icon: Activity,
      trend: comparison?.logsDelta ? comparison.logsDelta : null,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.title}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  {stat.trend !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(stat.trend)}
                      <span
                        className={cn(
                          stat.trend && stat.trend > 0
                            ? "text-green-600 dark:text-green-400"
                            : stat.trend && stat.trend < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {stat.trend !== null && stat.trend !== 0
                          ? `${stat.trend > 0 ? "+" : ""}${Math.abs(stat.trend).toFixed(1)}h`
                          : null}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

