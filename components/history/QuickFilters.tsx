"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp, Filter } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, isSameDay, isWithinInterval } from "date-fns";
import { HistoryFiltersState } from "./HistoryFilters";
import { cn } from "@/lib/utils";

interface QuickFiltersProps {
  onFilterSelect: (filters: Partial<HistoryFiltersState>) => void;
  currentFilters: HistoryFiltersState;
}

export function QuickFilters({ onFilterSelect, currentFilters }: QuickFiltersProps) {
  const today = new Date();
  
  // Helper to check if a date range matches the current filter
  const isFilterActive = (startDate: Date, endDate: Date): boolean => {
    try {
      const currentStart = new Date(currentFilters.startDate);
      const currentEnd = new Date(currentFilters.endDate);
      
      // Set to start/end of day for accurate comparison
      currentStart.setHours(0, 0, 0, 0);
      currentEnd.setHours(23, 59, 59, 999);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return (
        currentStart.getTime() === startDate.getTime() &&
        currentEnd.getTime() === endDate.getTime()
      );
    } catch {
      return false;
    }
  };

  // Define quick filter options with their date ranges
  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const yesterday = subDays(today, 1);
  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const lastWeek = subWeeks(today, 1);
  const lastWeekStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });
  
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const lastMonth = subMonths(today, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const quickFilters = [
    {
      label: "Today",
      icon: Calendar,
      startDate: todayDate,
      endDate: todayEnd,
      onClick: () => {
        const todayStr = format(today, "yyyy-MM-dd");
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: todayStr,
          endDate: todayStr,
        });
      },
    },
    {
      label: "Yesterday",
      icon: Calendar,
      startDate: yesterdayStart,
      endDate: yesterdayEnd,
      onClick: () => {
        const yesterdayStr = format(yesterday, "yyyy-MM-dd");
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: yesterdayStr,
          endDate: yesterdayStr,
        });
      },
    },
    {
      label: "This Week",
      icon: Clock,
      startDate: weekStart,
      endDate: weekEnd,
      onClick: () => {
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: format(weekStart, "yyyy-MM-dd"),
          endDate: format(weekEnd, "yyyy-MM-dd"),
        });
      },
    },
    {
      label: "Last Week",
      icon: Clock,
      startDate: lastWeekStart,
      endDate: lastWeekEnd,
      onClick: () => {
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: format(lastWeekStart, "yyyy-MM-dd"),
          endDate: format(lastWeekEnd, "yyyy-MM-dd"),
        });
      },
    },
    {
      label: "This Month",
      icon: TrendingUp,
      startDate: monthStart,
      endDate: monthEnd,
      onClick: () => {
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: format(monthStart, "yyyy-MM-dd"),
          endDate: format(monthEnd, "yyyy-MM-dd"),
        });
      },
    },
    {
      label: "Last Month",
      icon: TrendingUp,
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      onClick: () => {
        onFilterSelect({
          dateRangePreset: "custom" as const,
          startDate: format(lastMonthStart, "yyyy-MM-dd"),
          endDate: format(lastMonthEnd, "yyyy-MM-dd"),
        });
      },
    },
  ];

  return (
    <Card className="border-border/40">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Quick Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter, index) => {
            const isActive = isFilterActive(filter.startDate, filter.endDate);
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={filter.onClick}
                className={cn(
                  "gap-2 transition-all",
                  isActive && "shadow-sm"
                )}
              >
                <filter.icon className="h-3 w-3" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

