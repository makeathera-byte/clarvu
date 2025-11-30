"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { DailySummary } from "@/lib/types";

interface ComparisonCardProps {
  todaySummary: DailySummary | null;
  yesterdaySummary: DailySummary | null;
  todayRevenueMinutes?: number;
  yesterdayRevenueMinutes?: number;
  todayContextSwitches?: number;
  yesterdayContextSwitches?: number;
}

/**
 * Comparison card showing Today vs Yesterday metrics
 */
export function ComparisonCard({
  todaySummary,
  yesterdaySummary,
  todayRevenueMinutes = 0,
  yesterdayRevenueMinutes = 0,
  todayContextSwitches = 0,
  yesterdayContextSwitches = 0,
}: ComparisonCardProps) {
  if (!todaySummary && !yesterdaySummary) {
    return null;
  }

  const focusScoreDiff = todaySummary?.focus_score && yesterdaySummary?.focus_score
    ? todaySummary.focus_score - yesterdaySummary.focus_score
    : null;

  const revenueDiff = todayRevenueMinutes - yesterdayRevenueMinutes;
  const contextSwitchesDiff = todayContextSwitches - yesterdayContextSwitches;

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (diff: number) => {
    if (diff > 0) return "text-green-600 dark:text-green-400";
    if (diff < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const formatDiff = (diff: number, isMinutes = false) => {
    const prefix = diff > 0 ? "+" : "";
    if (isMinutes) {
      return `${prefix}${formatMinutes(Math.abs(diff))}`;
    }
    return `${prefix}${diff}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compared to Yesterday</CardTitle>
        <CardDescription>How today measures up</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {focusScoreDiff !== null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Focus Score</span>
            </div>
            <div className={`flex items-center gap-2 ${getTrendColor(focusScoreDiff)}`}>
              {getTrendIcon(focusScoreDiff)}
              <span className="text-sm font-semibold">{formatDiff(focusScoreDiff)}</span>
            </div>
          </div>
        )}

        {(todayRevenueMinutes > 0 || yesterdayRevenueMinutes > 0) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Revenue Time</span>
            </div>
            <div className={`flex items-center gap-2 ${getTrendColor(revenueDiff)}`}>
              {getTrendIcon(revenueDiff)}
              <span className="text-sm font-semibold">{formatDiff(revenueDiff, true)}</span>
            </div>
          </div>
        )}

        {(todayContextSwitches > 0 || yesterdayContextSwitches > 0) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Context Switches</span>
            </div>
            <div className={`flex items-center gap-2 ${getTrendColor(-contextSwitchesDiff)}`}>
              {/* Negative because fewer switches is better */}
              {contextSwitchesDiff < 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : contextSwitchesDiff > 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={`text-sm font-semibold ${getTrendColor(-contextSwitchesDiff)}`}>
                {formatDiff(-contextSwitchesDiff)}
              </span>
            </div>
          </div>
        )}

        {focusScoreDiff === null && revenueDiff === 0 && contextSwitchesDiff === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not enough data to compare yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

