'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryData {
    name: string;
    effectiveness: number;
    completedTasks: number;
    totalMinutes: number;
}

interface CategoryEffectivenessChartProps {
    categories: CategoryData[];
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'];

export function CategoryEffectivenessChart({ categories }: CategoryEffectivenessChartProps) {
    const { currentTheme } = useTheme();

    // Take top 6 categories
    const chartData = categories.slice(0, 6);

    return (
        <div className="w-full">
            <p className="font-medium mb-4" style={{ color: currentTheme.colors.foreground }}>
                Category Effectiveness
            </p>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.foreground, fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: currentTheme.colors.card,
                                border: `1px solid ${currentTheme.colors.border}`,
                                borderRadius: 12,
                                color: currentTheme.colors.foreground,
                            }}
                            formatter={(value: number, _name: string, props: any) => [
                                `${value}% effective`,
                                `${props.payload.completedTasks} tasks, ${props.payload.totalMinutes}m`,
                            ]}
                        />
                        <Bar dataKey="effectiveness" radius={[0, 8, 8, 0]}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
