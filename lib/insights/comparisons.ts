/**
 * Comparison engine for analyzing trends between time periods
 */

import { DailySummary, ActivityLog } from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils/time";

export interface ComparisonResult {
  focusScoreChange: number | null;
  revenueTimeDelta: number; // in minutes
  adminTimeDelta: number; // in minutes
  logsDelta: number;
  deepWorkDelta: number; // in minutes
  totalTimeDelta: number; // in minutes
}

/**
 * Compare today's data to yesterday's data
 */
export function compareTodayToYesterday(
  todayLogs: ActivityLog[],
  yesterdayLogs: ActivityLog[],
  todaySummary: DailySummary | null,
  yesterdaySummary: DailySummary | null
): ComparisonResult {
  const todayMetrics = calculateMetrics(todayLogs);
  const yesterdayMetrics = calculateMetrics(yesterdayLogs);

  const focusScoreChange = todaySummary?.focus_score && yesterdaySummary?.focus_score
    ? todaySummary.focus_score - yesterdaySummary.focus_score
    : null;

  return {
    focusScoreChange,
    revenueTimeDelta: todayMetrics.revenueMinutes - yesterdayMetrics.revenueMinutes,
    adminTimeDelta: todayMetrics.adminMinutes - yesterdayMetrics.adminMinutes,
    logsDelta: todayLogs.length - yesterdayLogs.length,
    deepWorkDelta: todayMetrics.deepWorkMinutes - yesterdayMetrics.deepWorkMinutes,
    totalTimeDelta: todayMetrics.totalMinutes - yesterdayMetrics.totalMinutes,
  };
}

/**
 * Compare this week's data to last week's data
 */
export function compareWeekToLastWeek(
  thisWeekSummaries: DailySummary[],
  lastWeekSummaries: DailySummary[]
): ComparisonResult {
  const thisWeekMetrics = aggregateSummaries(thisWeekSummaries);
  const lastWeekMetrics = aggregateSummaries(lastWeekSummaries);

  const avgFocusThisWeek = thisWeekMetrics.avgFocusScore;
  const avgFocusLastWeek = lastWeekMetrics.avgFocusScore;

  return {
    focusScoreChange: avgFocusThisWeek && avgFocusLastWeek
      ? avgFocusThisWeek - avgFocusLastWeek
      : null,
    revenueTimeDelta: thisWeekMetrics.revenueMinutes - lastWeekMetrics.revenueMinutes,
    adminTimeDelta: thisWeekMetrics.adminMinutes - lastWeekMetrics.adminMinutes,
    logsDelta: thisWeekMetrics.totalLogs - lastWeekMetrics.totalLogs,
    deepWorkDelta: thisWeekMetrics.deepWorkMinutes - lastWeekMetrics.deepWorkMinutes,
    totalTimeDelta: thisWeekMetrics.totalMinutes - lastWeekMetrics.totalMinutes,
  };
}

/**
 * Compare this month's data to last month's data
 */
export function compareMonthToLastMonth(
  thisMonthSummaries: DailySummary[],
  lastMonthSummaries: DailySummary[]
): ComparisonResult {
  // Similar to week comparison but aggregated monthly
  return compareWeekToLastWeek(thisMonthSummaries, lastMonthSummaries);
}

/**
 * Calculate metrics from activity logs
 */
function calculateMetrics(logs: ActivityLog[]) {
  let totalMinutes = 0;
  let revenueMinutes = 0;
  let adminMinutes = 0;
  let deepWorkMinutes = 0;

  logs.forEach((log) => {
    if (!log.start_time || !log.end_time) return;

    const duration = calculateDurationMinutes(log.start_time, log.end_time);
    if (duration <= 0) return;

    totalMinutes += duration;

    const businessType = log.categories?.business_type;
    if (businessType === "revenue") {
      revenueMinutes += duration;
      // Consider revenue activities longer than 60 minutes as deep work
      if (duration >= 60) {
        deepWorkMinutes += duration;
      }
    } else if (businessType === "admin") {
      adminMinutes += duration;
    }
  });

  return {
    totalMinutes,
    revenueMinutes,
    adminMinutes,
    deepWorkMinutes,
  };
}

/**
 * Aggregate metrics from daily summaries
 */
function aggregateSummaries(summaries: DailySummary[]) {
  let totalMinutes = 0;
  let revenueMinutes = 0;
  let adminMinutes = 0;
  let deepWorkMinutes = 0;
  let totalLogs = 0;
  let focusScores: number[] = [];

  // Note: Daily summaries don't have detailed breakdown, so we'll estimate
  // based on focus score and date ranges
  summaries.forEach((summary) => {
    if (summary.focus_score) {
      focusScores.push(summary.focus_score);
    }
    // Estimate based on focus score (higher focus = more deep work)
    const estimatedDailyMinutes = 480; // 8 hours average
    totalMinutes += estimatedDailyMinutes;
    
    if (summary.focus_score && summary.focus_score > 70) {
      deepWorkMinutes += estimatedDailyMinutes * 0.6;
      revenueMinutes += estimatedDailyMinutes * 0.5;
    } else if (summary.focus_score && summary.focus_score > 50) {
      deepWorkMinutes += estimatedDailyMinutes * 0.4;
      revenueMinutes += estimatedDailyMinutes * 0.4;
      adminMinutes += estimatedDailyMinutes * 0.3;
    } else {
      adminMinutes += estimatedDailyMinutes * 0.5;
      revenueMinutes += estimatedDailyMinutes * 0.3;
    }
  });

  return {
    totalMinutes,
    revenueMinutes,
    adminMinutes,
    deepWorkMinutes,
    totalLogs: summaries.length * 10, // Estimate
    avgFocusScore: focusScores.length > 0
      ? focusScores.reduce((a, b) => a + b, 0) / focusScores.length
      : null,
  };
}

/**
 * Format comparison result as human-readable text
 */
export function formatComparison(result: ComparisonResult): string[] {
  const insights: string[] = [];

  if (result.focusScoreChange !== null) {
    if (result.focusScoreChange > 5) {
      insights.push(`Focus score improved by ${result.focusScoreChange.toFixed(1)} points`);
    } else if (result.focusScoreChange < -5) {
      insights.push(`Focus score decreased by ${Math.abs(result.focusScoreChange).toFixed(1)} points`);
    }
  }

  if (result.revenueTimeDelta > 60) {
    insights.push(`+${Math.round(result.revenueTimeDelta / 60)}h more revenue time`);
  } else if (result.revenueTimeDelta < -60) {
    insights.push(`${Math.round(result.revenueTimeDelta / 60)}h less revenue time`);
  }

  if (result.deepWorkDelta > 60) {
    insights.push(`+${Math.round(result.deepWorkDelta / 60)}h more deep work`);
  } else if (result.deepWorkDelta < -60) {
    insights.push(`${Math.round(result.deepWorkDelta / 60)}h less deep work`);
  }

  return insights;
}

