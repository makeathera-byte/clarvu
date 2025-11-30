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
} from "recharts";
import { DailySummary } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

interface FocusScoreTrendChartProps {
  summaries: DailySummary[];
}

export function FocusScoreTrendChart({ summaries }: FocusScoreTrendChartProps) {
  const chartData = useMemo(() => {
    if (!summaries || summaries.length === 0) return [];

    return summaries
      .filter((s) => s.focus_score !== null && s.focus_score !== undefined)
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .map((summary) => ({
        date: format(parseISO(summary.date), "MMM d"),
        fullDate: summary.date,
        focusScore: summary.focus_score || 0,
      }));
  }, [summaries]);

  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.focusScore, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-lg">Focus Score Trend</CardTitle>
          <CardDescription>No focus score data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Focus Score Trend</CardTitle>
            <CardDescription>Focus score over the last 30 days</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{averageScore}%</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
        </div>
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
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [`${value}%`, "Focus Score"]}
            />
            <Line
              type="monotone"
              dataKey="focusScore"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

