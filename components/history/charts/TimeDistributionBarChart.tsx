"use client";

import { useMemo } from "react";
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
import { ActivityLog } from "@/lib/types";
import { format, parseISO, startOfDay } from "date-fns";
import { calculateDurationMinutes } from "@/lib/utils/time";
interface TimeDistributionBarChartProps {
  logs: ActivityLog[];
}

export function TimeDistributionBarChart({ logs }: TimeDistributionBarChartProps) {

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Group logs by date
    const logsByDate = new Map<string, ActivityLog[]>();

    logs.forEach((log) => {
      if (!log.start_time) return;
      const date = startOfDay(parseISO(log.start_time));
      const dateKey = format(date, "yyyy-MM-dd");

      if (!logsByDate.has(dateKey)) {
        logsByDate.set(dateKey, []);
      }
      logsByDate.get(dateKey)!.push(log);
    });

    // Calculate total time for each day
    const data = Array.from(logsByDate.entries())
      .map(([dateKey, dayLogs]) => {
        let totalMinutes = 0;

        dayLogs.forEach((log) => {
          if (!log.start_time || !log.end_time) return;
          const duration = calculateDurationMinutes(log.start_time, log.end_time);
          if (duration > 0) {
            totalMinutes += duration;
          }
        });

        return {
          date: format(parseISO(dateKey), "MMM d"),
          fullDate: dateKey,
          hours: Math.round((totalMinutes / 60) * 10) / 10,
        };
      })
      .sort((a, b) => {
        const dateA = parseISO(a.fullDate);
        const dateB = parseISO(b.fullDate);
        return dateA.getTime() - dateB.getTime();
      });

    return data;
  }, [logs]);

  if (chartData.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Time Distribution</CardTitle>
          <CardDescription>No time data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxHours = Math.max(...chartData.map((d) => d.hours), 0);

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Daily Time Distribution</CardTitle>
        <CardDescription>Total productive hours per day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, Math.max(maxHours + 1, 8)]}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{
                value: "Hours",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [`${value}h`, "Total Time"]}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="hsl(var(--primary))"
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

