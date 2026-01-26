'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    created_at: string;
}

interface Category {
    id: string;
    type: string;
}

interface WeekOverviewChartProps {
    tasks: Task[];
    categories: Category[];
}

export function WeekOverviewChart({ tasks, categories }: WeekOverviewChartProps) {
    const { currentTheme } = useTheme();

    // Deep work category types
    const deepWorkTypes = ['growth', 'delivery'];
    const categoryTypeMap = new Map(categories.map(c => [c.id, c.type]));

    // Get last 7 days
    const days: { date: Date; label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        days.push({
            date,
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            minutes: 0,
        });
    }

    // Calculate deep work minutes per day
    tasks
        .filter(t => t.status === 'completed')
        .forEach(task => {
            const type = categoryTypeMap.get(task.category_id || '');
            if (!type || !deepWorkTypes.includes(type)) return;

            const taskDate = new Date(task.start_time || task.created_at);
            taskDate.setHours(0, 0, 0, 0);

            const dayEntry = days.find(d => d.date.getTime() === taskDate.getTime());
            if (dayEntry) {
                dayEntry.minutes += task.duration_minutes || 30;
            }
        });

    const chartData = days.map(d => ({
        name: d.label,
        minutes: d.minutes,
    }));

    const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="px-3 py-2 rounded-xl text-sm backdrop-blur-lg border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.foreground,
                    }}
                >
                    <p className="font-medium">{label}</p>
                    <p style={{ color: currentTheme.colors.primary }}>
                        {payload[0].value} minutes
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm mb-6"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: currentTheme.colors.foreground }}
            >
                <Activity className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Week Overview
            </h3>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 12 }}
                            domain={[0, maxMinutes]}
                            tickFormatter={(value) => `${value}m`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar
                            dataKey="minutes"
                            fill={currentTheme.colors.primary}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div
                className="mt-4 p-3 rounded-xl text-center"
                style={{ backgroundColor: currentTheme.colors.muted }}
            >
                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                    Total deep work this week:{' '}
                    <span
                        className="font-semibold"
                        style={{ color: currentTheme.colors.primary }}
                    >
                        {chartData.reduce((acc, d) => acc + d.minutes, 0)} minutes
                    </span>
                </p>
            </div>
        </motion.div>
    );
}
