"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Filter, TrendingUp, TrendingDown, Minus, Clock, Activity } from "lucide-react";
import { calculateDurationMinutes } from "@/lib/utils/time";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ActivityLog {
  id: string;
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
}

interface TimelineChartProps {
  logs: any[];
}

type TimeRange = "today" | "week" | "month";

export function TimelineChart({ logs }: TimelineChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [comparisonRange, setComparisonRange] = useState<"none" | "previous">("none");

  // Filter logs based on time range
  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case "today":
        filterDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    let filtered = logs.filter((log) => {
      if (!log.start_time) return false;
      const logDate = new Date(log.start_time);
      return logDate >= filterDate;
    });

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter((log) => {
        const categoryName = log.categories?.name || "Other";
        return categoryName === selectedCategory;
      });
    }

    return filtered;
  }, [logs, timeRange, selectedCategory]);

  // Get comparison logs (previous period)
  const comparisonLogs = useMemo(() => {
    if (comparisonRange === "none" || !logs || logs.length === 0) return [];
    
    const now = new Date();
    const currentStart = new Date();
    const currentEnd = new Date();

    // Determine current period boundaries
    switch (timeRange) {
      case "today":
        currentStart.setHours(0, 0, 0, 0);
        currentEnd.setHours(23, 59, 59, 999);
        break;
      case "week":
        currentStart.setDate(now.getDate() - 7);
        currentEnd.setDate(now.getDate());
        break;
      case "month":
        currentStart.setMonth(now.getMonth() - 1);
        currentEnd.setMonth(now.getMonth());
        break;
    }

    // Calculate previous period
    const periodDuration = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodDuration);
    const previousEnd = new Date(currentStart.getTime());

    return logs.filter((log) => {
      if (!log.start_time) return false;
      const logDate = new Date(log.start_time);
      return logDate >= previousStart && logDate < previousEnd;
    });
  }, [logs, timeRange, comparisonRange]);

  // Process logs into timeline data grouped by hour blocks
  const { timelineData, stats, categories, peakHour } = useMemo(() => {
    if (!filteredLogs || filteredLogs.length === 0) {
      return { 
        timelineData: [], 
        stats: { totalTime: 0, activityCount: 0, avgDuration: 0 },
        categories: new Set<string>(),
        peakHour: null as number | null,
      };
    }

    // Get unique categories
    const categorySet = new Set<string>();
    filteredLogs.forEach((log) => {
      const categoryName = log.categories?.name || "Other";
      categorySet.add(categoryName);
    });

    // Group activities by hour blocks
    const hourBlocks = new Map<string, {
      hour: number;
      label: string;
      activities: Array<{
        duration: number;
        category: string;
        color: string;
        activity: string;
        log: ActivityLog;
      }>;
    }>();

    let totalMinutes = 0;
    let activityCount = 0;

    filteredLogs.forEach((log) => {
      if (!log.start_time || !log.end_time) return;

      const start = new Date(log.start_time);
      const hour = start.getHours();
      const duration = calculateDurationMinutes(log.start_time, log.end_time);

      if (duration <= 0) return;

      totalMinutes += duration;
      activityCount++;

      const hourLabel = `${hour}:00`;
      const category = log.categories?.name || "Other";
      const color = log.categories?.color || "#6b7280";

      if (!hourBlocks.has(hourLabel)) {
        hourBlocks.set(hourLabel, {
          hour,
          label: hourLabel,
          activities: [],
        });
      }

      hourBlocks.get(hourLabel)!.activities.push({
        duration,
        category,
        color,
        activity: log.activity,
        log,
      });
    });

    // Convert to array and aggregate by hour
    const data = Array.from(hourBlocks.values())
      .map((block) => {
        // Calculate total duration for the hour
        const totalDuration = block.activities.reduce((sum, act) => sum + act.duration, 0);
        
        // Get category breakdown
        const categoryBreakdown = new Map<string, number>();
        block.activities.forEach((act) => {
          const existing = categoryBreakdown.get(act.category) || 0;
          categoryBreakdown.set(act.category, existing + act.duration);
        });

        // Primary category (most time spent)
        const primaryCategory = Array.from(categoryBreakdown.entries())
          .sort((a, b) => b[1] - a[1])[0];
        const primaryColor = block.activities.find((a) => a.category === primaryCategory[0])?.color || "#6b7280";

        return {
          hour: block.hour,
          time: block.label,
          duration: totalDuration,
          category: primaryCategory[0],
          color: primaryColor,
          activities: block.activities,
          categoryBreakdown: Array.from(categoryBreakdown.entries()).map(([cat, dur]) => ({
            category: cat,
            duration: dur,
            color: block.activities.find((a) => a.category === cat)?.color || "#6b7280",
          })),
        };
      })
      .sort((a, b) => a.hour - b.hour);

    // Find peak hour
    let maxDuration = 0;
    let peak: number | null = null;
    data.forEach((item) => {
      if (item.duration > maxDuration) {
        maxDuration = item.duration;
        peak = item.hour;
      }
    });

    const avgDuration = activityCount > 0 ? Math.round(totalMinutes / activityCount) : 0;

    return {
      timelineData: data,
      stats: {
        totalTime: totalMinutes,
        activityCount,
        avgDuration,
      },
      categories: categorySet,
      peakHour: peak,
    };
  }, [filteredLogs]);

  // Process comparison data
  const comparisonData = useMemo(() => {
    if (comparisonRange === "none" || !comparisonLogs || comparisonLogs.length === 0) {
      return null;
    }

    const hourBlocks = new Map<string, number>();

    comparisonLogs.forEach((log) => {
      if (!log.start_time || !log.end_time) return;
      const start = new Date(log.start_time);
      const hour = start.getHours();
      const duration = calculateDurationMinutes(log.start_time, log.end_time);
      if (duration <= 0) return;

      const hourLabel = `${hour}:00`;
      const existing = hourBlocks.get(hourLabel) || 0;
      hourBlocks.set(hourLabel, existing + duration);
    });

    const comparisonTotal = Array.from(hourBlocks.values()).reduce((sum, d) => sum + d, 0);

    return {
      totalTime: comparisonTotal,
      activityCount: comparisonLogs.length,
    };
  }, [comparisonLogs, comparisonRange]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSelected = selectedHour === data.time;

      return (
        <div className="rounded-lg border border-border/40 bg-popover p-3 shadow-lg min-w-[200px]">
          <p className="text-sm font-semibold mb-2 text-popover-foreground">{data.time}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-xs font-medium text-popover-foreground">
                {formatDuration(data.duration)}
              </span>
            </div>
            
            {/* Category Breakdown */}
            {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs font-medium text-popover-foreground mb-1.5">By Category:</p>
                <div className="space-y-1">
                  {data.categoryBreakdown.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </div>
                      <span className="text-xs font-medium text-popover-foreground">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities List */}
            {data.activities && data.activities.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs font-medium text-popover-foreground mb-1.5">
                  Activities ({data.activities.length}):
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.activities.slice(0, 5).map((act: any, idx: number) => (
                    <div key={idx} className="text-xs text-muted-foreground truncate">
                      • {act.activity} ({formatDuration(act.duration)})
                    </div>
                  ))}
                  {data.activities.length > 5 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{data.activities.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHour(null);
                }}
                className="text-xs text-primary hover:underline mt-2"
              >
                Click bar to view details
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    const fill = payload.color || "hsl(var(--primary))";
    const isPeak = payload.hour === peakHour;
    const isSelected = selectedHour === payload.time;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={6}
          ry={6}
          opacity={isSelected ? 1 : isPeak ? 0.85 : 0.7}
          className={cn(
            "transition-all duration-200 cursor-pointer",
            isSelected && "ring-2 ring-primary ring-offset-2",
            !isSelected && "hover:opacity-100"
          )}
          onClick={() => {
            setSelectedHour(isSelected ? null : payload.time);
          }}
        />
        {isPeak && (
          <text
            x={x + width / 2}
            y={y - 4}
            textAnchor="middle"
            className="text-[10px] fill-muted-foreground"
          >
            ⭐
          </text>
        )}
      </g>
    );
  };

  // Calculate comparison percentage
  const comparisonPercent = useMemo(() => {
    if (!comparisonData || stats.totalTime === 0) return null;
    if (comparisonData.totalTime === 0) return null;

    const diff = stats.totalTime - comparisonData.totalTime;
    const percent = (diff / comparisonData.totalTime) * 100;
    return percent;
  }, [stats.totalTime, comparisonData]);

  if (!logs || logs.length === 0 || timelineData.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
          <CardDescription>Visual overview of your activities over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Start logging activities to see your timeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <CardDescription className="text-xs text-muted-foreground">
                {formatDuration(stats.totalTime)} total • {stats.activityCount} activities
                {stats.avgDuration > 0 && ` • ${formatDuration(stats.avgDuration)} avg`}
              </CardDescription>
              {peakHour !== null && (
                <Badge variant="secondary" className="text-xs">
                  Peak: {peakHour}:00
                </Badge>
              )}
              {comparisonPercent !== null && (
                <div className="flex items-center gap-1 text-xs">
                  {comparisonPercent > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : comparisonPercent < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      comparisonPercent > 0
                        ? "text-green-600 dark:text-green-400"
                        : comparisonPercent < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {comparisonPercent > 0 ? "+" : ""}
                    {comparisonPercent.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={comparisonRange}
              onValueChange={(value) => setComparisonRange(value as "none" | "previous")}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Compare</SelectItem>
                <SelectItem value="previous">vs Previous</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter */}
        {categories.size > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Filter:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {Array.from(categories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={timelineData}
            margin={{ top: peakHour !== null ? 15 : 5, right: 5, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="hsl(var(--border))"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="duration" shape={<CustomBar />} radius={[6, 6, 0, 0]}>
              {timelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Selected Hour Details */}
        {selectedHour && (
          <div className="mt-4 pt-4 border-t border-border/40">
            {(() => {
              const selected = timelineData.find((d) => d.time === selectedHour);
              if (!selected) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Hour Details: {selected.time}</p>
                    <button
                      onClick={() => setSelectedHour(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Total Time:</span>
                      <p className="font-medium">{formatDuration(selected.duration)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Activities:</span>
                      <p className="font-medium">{selected.activities.length}</p>
                    </div>
                  </div>
                  {selected.activities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Activity List:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selected.activities.map((act, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/30"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: act.color }}
                              />
                              <span className="truncate">{act.activity}</span>
                            </div>
                            <span className="font-medium ml-2 flex-shrink-0">
                              {formatDuration(act.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Minimal Legend */}
        {timelineData.length > 0 && !selectedHour && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
            {Array.from(
              new Map(timelineData.map((d) => [d.category, d.color])).entries()
            ).map(([category, color]) => (
              <div
                key={category}
                className="flex items-center gap-1.5 text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
