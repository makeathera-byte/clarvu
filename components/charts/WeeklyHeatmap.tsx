"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityLog {
  id: string;
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
}

interface WeeklyHeatmapProps {
  logs: any[]; // Flexible type to handle Supabase response structure
  weekStart?: string;
}

export function WeeklyHeatmap({ logs }: WeeklyHeatmapProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Weekly Productivity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Log activities to see your weekly patterns
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process logs for weekly heatmap
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i); // 0-23

  // Create heatmap data structure
  const heatmapData: Record<string, Record<number, number>> = {};
  daysOfWeek.forEach((day) => {
    heatmapData[day] = {};
    hoursOfDay.forEach((hour) => {
      heatmapData[day][hour] = 0;
    });
  });

  // Populate heatmap with log data
  logs.forEach((log) => {
    if (log.start_time && log.end_time) {
      const start = new Date(log.start_time);
      const dayIndex = start.getDay();
      const dayName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday (0) to index 6
      const hour = start.getHours();
      const duration = Math.floor(
        (new Date(log.end_time).getTime() - start.getTime()) / (1000 * 60)
      );

      if (heatmapData[dayName] && heatmapData[dayName][hour] !== undefined) {
        heatmapData[dayName][hour] += duration;
      }
    }
  });

  // Calculate intensity levels for colors
  const getIntensity = (minutes: number): string => {
    if (minutes === 0) return "bg-stone-100 dark:bg-stone-800/30";
    if (minutes < 30) return "bg-stone-200 dark:bg-stone-700/40";
    if (minutes < 60) return "bg-stone-300 dark:bg-stone-600/50";
    if (minutes < 120) return "bg-stone-400 dark:bg-stone-500/60";
    return "bg-stone-500 dark:bg-stone-400/70";
  };

  const getMaxMinutes = () => {
    let max = 0;
    daysOfWeek.forEach((day) => {
      hoursOfDay.forEach((hour) => {
        max = Math.max(max, heatmapData[day][hour]);
      });
    });
    return max;
  };

  const maxMinutes = getMaxMinutes();

  // Group hours for display (show every 2 hours to reduce clutter)
  const displayHours = hoursOfDay.filter((hour) => hour % 2 === 0);

  return (
    <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Weekly Productivity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-medium text-muted-foreground text-left py-2 px-2">
                    Day
                  </th>
                  {displayHours.map((hour) => (
                    <th
                      key={hour}
                      className="text-xs font-medium text-muted-foreground py-2 px-1 text-center"
                      title={`${hour}:00 - ${hour + 1}:59`}
                    >
                      {hour}:00
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map((day) => (
                  <tr key={day}>
                    <td className="text-xs font-medium text-foreground py-2 px-2 sticky left-0 bg-[#f7f7f8] dark:bg-stone-900/50">
                      {day}
                    </td>
                    {displayHours.map((hour) => {
                      const minutes = heatmapData[day][hour] || 0;
                      const intensity = getIntensity(minutes);
                      return (
                        <td
                          key={`${day}-${hour}`}
                          className={`${intensity} rounded-sm transition-colors hover:ring-2 hover:ring-border/50 cursor-pointer py-2 px-1 min-w-[24px]`}
                          title={`${day} ${hour}:00 - ${minutes} minutes`}
                        >
                          {minutes > 0 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              {minutes > 60
                                ? `${Math.floor(minutes / 60)}h`
                                : `${minutes}m`}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Less activity</span>
            <span className="text-xs text-muted-foreground">More activity</span>
          </div>
          <div className="flex gap-1 h-4">
            <div className="flex-1 bg-stone-100 dark:bg-stone-800/30 rounded-sm" />
            <div className="flex-1 bg-stone-200 dark:bg-stone-700/40 rounded-sm" />
            <div className="flex-1 bg-stone-300 dark:bg-stone-600/50 rounded-sm" />
            <div className="flex-1 bg-stone-400 dark:bg-stone-500/60 rounded-sm" />
            <div className="flex-1 bg-stone-500 dark:bg-stone-400/70 rounded-sm" />
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2 text-center">
            Peak: {maxMinutes > 0 ? `${maxMinutes} minutes` : "No data"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

