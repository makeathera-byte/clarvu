'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyDeepWorkChartProps {
    data: Array<{ date: string; minutes: number; displayDate: string }>;
    weeklyAvg: number;
}

export function WeeklyDeepWorkChart({ data, weeklyAvg }: WeeklyDeepWorkChartProps) {
    const { currentTheme } = useTheme();

    // Get last 14 days for display
    const chartData = data.slice(-14);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>
                    Deep Work Trend
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                    Avg: {weeklyAvg}m/day
                </p>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="deepWorkGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentTheme.colors.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={currentTheme.colors.primary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: currentTheme.colors.card,
                                border: `1px solid ${currentTheme.colors.border}`,
                                borderRadius: 12,
                                color: currentTheme.colors.foreground,
                            }}
                            labelStyle={{ color: currentTheme.colors.foreground }}
                            formatter={(value: number) => [`${value} min`, 'Deep Work']}
                        />
                        <Area
                            type="monotone"
                            dataKey="minutes"
                            stroke={currentTheme.colors.primary}
                            strokeWidth={2}
                            fill="url(#deepWorkGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
