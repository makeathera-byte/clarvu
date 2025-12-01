"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface VisitorsChartProps {
  data: Array<{ date: string; visitors: number }>;
}

export function VisitorsChart({ data }: VisitorsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lineColor = isDark ? "#ffffff" : "#3b82f6"; // Blue for light mode
  const dotColor = isDark ? "#ffffff" : "#3b82f6";
  
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Unique Visitors (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No visitor data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Unique Visitors (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`${value} visitors`, "Unique Visitors"]}
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                color: "#000000",
                padding: "10px 12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)",
                fontWeight: 500,
                outline: "2px solid rgba(255, 255, 255, 0.8)",
                outlineOffset: "2px"
              }}
              labelStyle={{ color: "#000000", fontWeight: 700, fontSize: "13px" }}
              itemStyle={{ color: "#000000", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: dotColor, r: 4 }}
              activeDot={{ r: 6, fill: dotColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

