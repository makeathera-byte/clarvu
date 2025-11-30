"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ActivityLog } from "@/lib/types";
import { format, parseISO, startOfDay } from "date-fns";
import { calculateDurationMinutes } from "@/lib/utils/time";

interface ProductivityTrendChartProps {
  logs: ActivityLog[];
}

export function ProductivityTrendChart({ logs }: ProductivityTrendChartProps) {
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

    // Calculate metrics for each day
    const data = Array.from(logsByDate.entries())
      .map(([dateKey, dayLogs]) => {
        let deepWorkMinutes = 0;
        let adminMinutes = 0;
        let breakMinutes = 0;

        dayLogs.forEach((log) => {
          if (!log.start_time || !log.end_time) return;

          const duration = calculateDurationMinutes(log.start_time, log.end_time);
          if (duration <= 0) return;

          const businessType = log.categories?.business_type;

          if (businessType === "revenue" && duration >= 60) {
            deepWorkMinutes += duration;
          } else if (businessType === "admin") {
            adminMinutes += duration;
          } else if (businessType === "break") {
            breakMinutes += duration;
          }
        });

        return {
          date: format(parseISO(dateKey), "MMM d"),
          fullDate: dateKey,
          deepWork: Math.round(deepWorkMinutes / 60 * 10) / 10, // Convert to hours
          admin: Math.round(adminMinutes / 60 * 10) / 10,
          break: Math.round(breakMinutes / 60 * 10) / 10,
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
          <CardTitle className="text-lg">Productivity Trends</CardTitle>
          <CardDescription>No productivity data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Productivity Trends</CardTitle>
        <CardDescription>Time distribution by activity type over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
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
              formatter={(value: any, name: string) => [
                `${value}h`,
                name === "deepWork"
                  ? "Deep Work"
                  : name === "admin"
                  ? "Admin"
                  : "Break",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value) =>
                value === "deepWork"
                  ? "Deep Work"
                  : value === "admin"
                  ? "Admin"
                  : "Break"
              }
            />
            <Line
              type="monotone"
              dataKey="deepWork"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
              name="deepWork"
            />
            <Line
              type="monotone"
              dataKey="admin"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: "#8884d8", r: 3 }}
              name="admin"
            />
            <Line
              type="monotone"
              dataKey="break"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ fill: "#82ca9d", r: 3 }}
              name="break"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

