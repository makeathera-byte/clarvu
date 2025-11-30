"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { ActivityLog } from "@/lib/types";

interface CategoryPieChartProps {
  logs: ActivityLog[];
}

interface CategoryData {
  name: string;
  value: number; // minutes
  color: string;
}

/**
 * Category pie chart showing time distribution by category
 * Displays today's activity breakdown
 */
export function CategoryPieChart({ logs }: CategoryPieChartProps) {
  // Calculate total time per category
  const categoryMap = new Map<string, { name: string; minutes: number; color: string }>();

  logs.forEach((log) => {
    if (!log.start_time) return;

    const category = log.categories;
    const categoryName = category?.name || "Uncategorized";
    const categoryColor = category?.color || "#6b7280";

    // Calculate duration in minutes
    const startTime = new Date(log.start_time);
    const endTime = log.end_time ? new Date(log.end_time) : new Date();
    const minutes = calculateDurationMinutes(startTime, endTime);

    if (minutes <= 0) return;

    const existing = categoryMap.get(categoryName);
    if (existing) {
      existing.minutes += minutes;
    } else {
      categoryMap.set(categoryName, {
        name: categoryName,
        minutes,
        color: categoryColor,
      });
    }
  });

  const data: CategoryData[] = Array.from(categoryMap.values())
    .map((cat) => ({
      name: cat.name,
      value: Math.round(cat.minutes),
      color: cat.color,
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time by Category</CardTitle>
          <CardDescription>Today&apos;s activity distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No activity data for today
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatDuration(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time by Category</CardTitle>
        <CardDescription>Today&apos;s activity distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const item = data.find((d) => d.name === value);
                return item ? `${value} (${formatDuration(item.value)})` : value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

