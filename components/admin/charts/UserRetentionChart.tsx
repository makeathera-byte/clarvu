"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface UserRetentionChartProps {
  data: {
    newUsers: number;
    returningUsers: number;
  };
}

export function UserRetentionChart({ data }: UserRetentionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const COLORS = isDark 
    ? ["#60a5fa", "#a78bfa"] // Light blue and light purple for dark mode
    : ["#3b82f6", "#6b7280"]; // Blue and gray for light mode
  
  const chartData = [
    { name: "New Users", value: data.newUsers },
    { name: "Returning Users", value: data.returningUsers },
  ];

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">User Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

