"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo } from "react";

interface DevicePieChartProps {
  data: Array<{ device: string; count: number }>;
}

// Better color palette for device types (light mode)
const DEVICE_COLORS_LIGHT: Record<string, string> = {
  desktop: "#3b82f6", // Blue
  mobile: "#8b5cf6", // Purple
  tablet: "#10b981", // Green
  unknown: "#6b7280", // Gray
};

// Different colors for dark mode (light colors that stand out on dark background)
const DEVICE_COLORS_DARK: Record<string, string> = {
  desktop: "#60a5fa", // Light blue
  mobile: "#a78bfa", // Light purple
  tablet: "#34d399", // Light green
  unknown: "#94a3b8", // Light gray
};

const FALLBACK_COLORS_LIGHT = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
];

const FALLBACK_COLORS_DARK = [
  "#60a5fa", // Light blue
  "#a78bfa", // Light purple
  "#34d399", // Light green
  "#fbbf24", // Light amber
  "#f87171", // Light red
];

export function DevicePieChart({ data }: DevicePieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const DEVICE_COLORS = isDark ? DEVICE_COLORS_DARK : DEVICE_COLORS_LIGHT;
  const FALLBACK_COLORS = isDark ? FALLBACK_COLORS_DARK : FALLBACK_COLORS_LIGHT;
  
  // Format device names for display
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => ({
      ...item,
      deviceLabel: item.device === "unknown" 
        ? "Unknown" 
        : item.device.charAt(0).toUpperCase() + item.device.slice(1),
    }));
  }, [data]);

  // Calculate total for percentages
  const total = useMemo(() => {
    return formattedData.reduce((sum, item) => sum + item.count, 0);
  }, [formattedData]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Traffic by Device</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No device data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Traffic by Device</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Device distribution for the last 7 days
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ deviceLabel, count }) => {
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                return `${deviceLabel}: ${percentage}%`;
              }}
              outerRadius={90}
              innerRadius={40}
              paddingAngle={2}
              dataKey="count"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={DEVICE_COLORS[entry.device] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} 
                />
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
              formatter={(value: number, name: string, props: any) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return [`${value.toLocaleString()} visits (${percentage}%)`, props.payload.deviceLabel];
              }}
            />
            <Legend 
              formatter={(value, entry: any) => {
                const item = formattedData.find(d => d.deviceLabel === value);
                if (!item) return value;
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
                return `${value} (${percentage}%)`;
              }}
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Device list below chart */}
        <div className="mt-4 space-y-2">
          {formattedData
            .sort((a, b) => b.count - a.count)
            .map((item, index) => {
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              const color = DEVICE_COLORS[item.device] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              
              return (
                <div key={item.device} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-foreground">{item.deviceLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.count.toLocaleString()} visits</span>
                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

