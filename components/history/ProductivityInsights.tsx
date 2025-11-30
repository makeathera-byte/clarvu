"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLog, DailySummary } from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { format, parseISO, startOfWeek, endOfWeek, isSameWeek, isSameMonth } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Zap,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductivityInsightsProps {
  logs: ActivityLog[];
  summaries: DailySummary[];
}

export function ProductivityInsights({ logs, summaries }: ProductivityInsightsProps) {
  const insights = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    // Calculate weekly patterns
    const weeklyData = new Map<string, { minutes: number; count: number }>();
    const monthlyData = new Map<string, { minutes: number; count: number }>();
    let totalMinutes = 0;
    let revenueMinutes = 0;
    let deepWorkSessions = 0;
    const categoryMap = new Map<string, number>();
    const dayOfWeekMap = new Map<number, number>();
    
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    logs.forEach((log) => {
      if (!log.start_time || !log.end_time) return;
      
      const logDate = parseISO(log.start_time);
      const duration = calculateDurationMinutes(log.start_time, log.end_time);
      if (duration <= 0) return;

      totalMinutes += duration;

      // Weekly pattern
      const weekKey = format(startOfWeek(logDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const weekData = weeklyData.get(weekKey) || { minutes: 0, count: 0 };
      weekData.minutes += duration;
      weekData.count += 1;
      weeklyData.set(weekKey, weekData);

      // Monthly pattern
      const monthKey = format(logDate, "yyyy-MM");
      const monthData = monthlyData.get(monthKey) || { minutes: 0, count: 0 };
      monthData.minutes += duration;
      monthData.count += 1;
      monthlyData.set(monthKey, monthData);

      // Day of week pattern
      const dayOfWeek = logDate.getDay();
      dayOfWeekMap.set(dayOfWeek, (dayOfWeekMap.get(dayOfWeek) || 0) + duration);

      // Revenue time
      const businessType = log.categories?.business_type;
      if (businessType === "revenue") {
        revenueMinutes += duration;
        if (duration >= 60) {
          deepWorkSessions += 1;
        }
      }

      // Category distribution
      const categoryName = log.categories?.name || "Uncategorized";
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + duration);
    });

    // Find most productive day
    let mostProductiveDay = 0;
    let maxMinutes = 0;
    dayOfWeekMap.forEach((minutes, day) => {
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        mostProductiveDay = day;
      }
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Calculate trends
    const weeklyEntries = Array.from(weeklyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4); // Last 4 weeks

    const weeklyTrend = weeklyEntries.length >= 2
      ? weeklyEntries[weeklyEntries.length - 1][1].minutes - weeklyEntries[0][1].minutes
      : 0;

    // Find top category
    let topCategory = "";
    let topCategoryMinutes = 0;
    categoryMap.forEach((minutes, category) => {
      if (minutes > topCategoryMinutes) {
        topCategoryMinutes = minutes;
        topCategory = category;
      }
    });

    // Calculate productivity score
    const totalHours = totalMinutes / 60;
    const revenuePercentage = totalHours > 0 ? (revenueMinutes / 60 / totalHours) * 100 : 0;
    const avgSessionDuration = logs.length > 0 ? totalMinutes / logs.length : 0;
    const productivityScore = Math.min(
      100,
      Math.round(
        (revenuePercentage * 0.5) +
        (Math.min(avgSessionDuration / 60, 2) * 25) +
        (deepWorkSessions * 5)
      )
    );

    // Calculate average focus score
    const focusScores = summaries
      .map((s) => s.focus_score)
      .filter((score): score is number => score !== null && score !== undefined);
    const avgFocusScore = focusScores.length > 0
      ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
      : null;

    return {
      totalHours,
      revenuePercentage,
      productivityScore,
      avgFocusScore,
      deepWorkSessions,
      mostProductiveDay: dayNames[mostProductiveDay],
      topCategory,
      weeklyTrend,
      weeklyTrendPercent: weeklyEntries.length >= 2
        ? ((weeklyTrend / weeklyEntries[0][1].minutes) * 100)
        : 0,
    };
  }, [logs, summaries]);

  if (!insights) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Start tracking activities to see insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Productivity Score */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Productivity Score</div>
              <div className="text-xs text-muted-foreground">Based on revenue time & deep work</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{insights.productivityScore}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue Time</span>
            </div>
            <div className="text-lg font-semibold">{insights.revenuePercentage.toFixed(0)}%</div>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Deep Work</span>
            </div>
            <div className="text-lg font-semibold">{insights.deepWorkSessions}</div>
            <div className="text-xs text-muted-foreground">sessions</div>
          </div>
        </div>

        {/* Weekly Trend */}
        {insights.weeklyTrend !== 0 && (
          <div className="p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weekly Trend</span>
              <div className="flex items-center gap-2">
                {insights.weeklyTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    insights.weeklyTrend > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {insights.weeklyTrend > 0 ? "+" : ""}
                  {Math.abs(insights.weeklyTrendPercent).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Patterns */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Most Productive Day:</span>
            <span className="font-medium">{insights.mostProductiveDay}</span>
          </div>
          {insights.topCategory && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Top Category:</span>
              <span className="font-medium">{insights.topCategory}</span>
            </div>
          )}
          {insights.avgFocusScore !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Avg Focus Score:</span>
              <span className="font-medium">{Math.round(insights.avgFocusScore)}%</span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="pt-4 border-t border-border/40">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Recommendations</div>
              <div className="text-xs text-muted-foreground space-y-1">
                {insights.revenuePercentage < 40 && (
                  <p>• Increase revenue-generating activities (currently {insights.revenuePercentage.toFixed(0)}%)</p>
                )}
                {insights.deepWorkSessions < 3 && (
                  <p>• Aim for at least 3 deep work sessions per week</p>
                )}
                {insights.avgFocusScore !== null && insights.avgFocusScore < 60 && (
                  <p>• Focus score is below average - try reducing distractions</p>
                )}
                {insights.revenuePercentage >= 60 && insights.deepWorkSessions >= 3 && (
                  <p>• Great job! You're maintaining high productivity levels</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

