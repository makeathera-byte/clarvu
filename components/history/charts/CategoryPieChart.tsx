"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ActivityLog } from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils/time";

interface CategoryPieChartProps {
  logs: ActivityLog[];
  title?: string;
  description?: string;
}

export function CategoryPieChart({
  logs,
  title = "Category Distribution",
  description = "Time spent by category",
}: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const categoryMap = new Map<
      string,
      { name: string; minutes: number; color: string }
    >();

    logs.forEach((log) => {
      if (!log.start_time || !log.end_time) return;

      const duration = calculateDurationMinutes(log.start_time, log.end_time);
      if (duration <= 0) return;

      const categoryName = log.categories?.name || "Uncategorized";
      const categoryColor = log.categories?.color || "#8884d8";
      const categoryId = log.categories?.id || "uncategorized";

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.minutes += duration;
      } else {
        categoryMap.set(categoryId, {
          name: categoryName,
          minutes: duration,
          color: categoryColor,
        });
      }
    });

    // Convert to array and calculate percentages
    const totalMinutes = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.minutes,
      0
    );

    return Array.from(categoryMap.values())
      .map((cat) => ({
        name: cat.name,
        value: Math.round((cat.minutes / totalMinutes) * 100),
        minutes: cat.minutes,
        hours: Math.round((cat.minutes / 60) * 10) / 10,
        color: cat.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  if (chartData.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>No category data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const COLORS = chartData.map((d) => d.color);

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any, name: string, props: any) => [
                `${value}% (${props.payload.hours}h)`,
                props.payload.name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.value}%)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

