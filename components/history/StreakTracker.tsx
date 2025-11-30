"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/lib/types";
import { format, parseISO, isSameDay, eachDayOfInterval, subDays, startOfDay } from "date-fns";
import { Flame, Target, Calendar } from "lucide-react";

interface StreakTrackerProps {
  logs: ActivityLog[];
}

export function StreakTracker({ logs }: StreakTrackerProps) {
  const streakData = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);
    
    // Get unique days with activities
    const activeDays = new Set<string>();
    logs.forEach((log) => {
      if (log.start_time) {
        const logDay = format(parseISO(log.start_time), "yyyy-MM-dd");
        activeDays.add(logDay);
      }
    });

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    let checkDate = today;
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (activeDays.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak in last 30 days
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    let longestStreak = 0;
    let tempStreak = 0;

    days.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      if (activeDays.has(dateStr)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Calculate weekly goal progress
    const thisWeekStart = subDays(today, today.getDay());
    const thisWeekDays = eachDayOfInterval({
      start: thisWeekStart,
      end: today,
    });
    
    const thisWeekActiveDays = thisWeekDays.filter((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return activeDays.has(dateStr);
    }).length;

    const weeklyGoal = 5; // 5 days per week
    const weeklyProgress = Math.min((thisWeekActiveDays / weeklyGoal) * 100, 100);

    // Calculate total active days
    const totalActiveDays = activeDays.size;

    return {
      currentStreak,
      longestStreak,
      weeklyProgress,
      thisWeekActiveDays,
      weeklyGoal,
      totalActiveDays,
    };
  }, [logs]);

  if (!streakData) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Activity Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Start tracking activities to build your streak!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Activity Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="text-sm font-medium">Current Streak</div>
              <div className="text-xs text-muted-foreground">Days in a row</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {streakData.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">
              {streakData.currentStreak === 1 ? "day" : "days"}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Longest Streak</span>
            </div>
            <div className="text-xl font-semibold">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">(last 30 days)</div>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-background/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Days</span>
            </div>
            <div className="text-xl font-semibold">{streakData.totalActiveDays}</div>
            <div className="text-xs text-muted-foreground">with activity</div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Weekly Goal Progress</span>
            <span className="text-muted-foreground">
              {streakData.thisWeekActiveDays} / {streakData.weeklyGoal} days
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${streakData.weeklyProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>This week</span>
            <span>{Math.round(streakData.weeklyProgress)}%</span>
          </div>
        </div>

        {/* Encouragement */}
        {streakData.currentStreak >= 7 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                🔥 Amazing! {streakData.currentStreak} days strong! Keep it up!
              </span>
            </div>
          </div>
        )}

        {streakData.currentStreak >= 3 && streakData.currentStreak < 7 && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Great streak! Aim for 7 days!
              </span>
            </div>
          </div>
        )}

        {streakData.currentStreak === 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Start tracking today to begin your streak!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

