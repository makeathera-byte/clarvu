"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COUNTRIES } from "@/lib/utils/countries";

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode === "unknown" || countryCode.length !== 2) {
    return "🌍";
  }
  
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return "🌍";
  }
}

interface CountryChartProps {
  data: Array<{ country: string; count: number }>;
}

export function CountryChart({ data }: CountryChartProps) {
  // Transform data to include country names and flags
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => {
      const countryCode = item.country.toUpperCase();
      const countryInfo = COUNTRIES.find((c) => c.code === countryCode);
      
      return {
        country: item.country,
        countryName: countryInfo?.name || (item.country === "unknown" ? "Unknown" : item.country),
        flag: countryInfo ? getCountryFlag(countryCode) : "",
        count: item.count,
        displayName: countryInfo 
          ? `${getCountryFlag(countryCode)} ${countryInfo.name}` 
          : (item.country === "unknown" ? "Unknown" : item.country),
      };
    }).sort((a, b) => b.count - a.count);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Traffic by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No country data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Color palette for bars - white in dark mode, blue in light mode
  const colors = isDark 
    ? ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]
    : ["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"]; // Blue for light mode

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Traffic by Country</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Country data is automatically updated from timezone detection and IP geolocation
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis 
              type="category" 
              dataKey="displayName" 
              className="text-xs"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#ffffff", 
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "#000000",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)",
                fontWeight: 500,
                outline: "2px solid rgba(255, 255, 255, 0.8)",
                outlineOffset: "2px"
              }}
              labelStyle={{ color: "#000000", fontWeight: 700, fontSize: "13px" }}
              itemStyle={{ color: "#000000", fontWeight: 600 }}
              formatter={(value: number) => [`${value} visits`, "Visits"]}
              labelFormatter={(label) => `Country: ${label}`}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Country list below chart */}
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {chartData.slice(0, 5).map((item, index) => (
            <div key={item.country} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span className="font-medium">{item.countryName}</span>
              </div>
              <span className="text-muted-foreground">{item.count} visits</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

