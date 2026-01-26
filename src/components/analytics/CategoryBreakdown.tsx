'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    duration_minutes: number | null;
    category_id: string | null;
    start_time: string | null;
    end_time: string | null;
    created_at: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface CategoryBreakdownProps {
    tasks: Task[];
    categories: Category[];
}

export function CategoryBreakdown({ tasks, categories }: CategoryBreakdownProps) {
    const { currentTheme } = useTheme();

    // Group tasks by category and sum duration
    const categoryData = categories.map(cat => {
        const categoryTasks = tasks.filter(t =>
            t.category_id === cat.id &&
            (t.status === 'completed' || t.status === 'in_progress')
        );

        const totalMinutes = categoryTasks.reduce((acc, t) => {
            if (t.duration_minutes) return acc + t.duration_minutes;
            if (t.start_time) {
                const start = new Date(t.start_time);
                const end = t.end_time ? new Date(t.end_time) : new Date();
                return acc + Math.round((end.getTime() - start.getTime()) / 60000);
            }
            return acc + 30;
        }, 0);

        return {
            name: cat.name,
            value: totalMinutes,
            color: cat.color,
        };
    }).filter(d => d.value > 0);

    // Add uncategorized
    const uncategorizedTasks = tasks.filter(t =>
        !t.category_id &&
        (t.status === 'completed' || t.status === 'in_progress')
    );

    if (uncategorizedTasks.length > 0) {
        const totalMinutes = uncategorizedTasks.reduce((acc, t) =>
            acc + (t.duration_minutes || 30), 0
        );
        categoryData.push({
            name: 'Uncategorized',
            value: totalMinutes,
            color: currentTheme.colors.mutedForeground,
        });
    }

    const totalMinutes = categoryData.reduce((acc, d) => acc + d.value, 0);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = totalMinutes > 0
                ? Math.round((data.value / totalMinutes) * 100)
                : 0;

            return (
                <div
                    className="px-3 py-2 rounded-xl text-sm backdrop-blur-lg border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.foreground,
                    }}
                >
                    <p className="font-medium">{data.name}</p>
                    <p style={{ color: data.color }}>
                        {data.value}m ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    if (categoryData.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="p-6 rounded-2xl border backdrop-blur-sm mb-6"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <PieChartIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    Category Breakdown (Last 7 Days)
                </h3>

                <div className="text-center py-8">
                    <PieChartIcon
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No completed tasks in the last 7 days
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
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
                <PieChartIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Category Breakdown (Last 7 Days)
            </h3>

            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Chart */}
                <motion.div
                    className="w-48 h-48"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                    {categoryData.map((entry, index) => {
                        const percentage = totalMinutes > 0
                            ? Math.round((entry.value / totalMinutes) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={entry.name}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="flex items-center gap-2 p-2 rounded-xl"
                                style={{ backgroundColor: `${entry.color}10` }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-medium truncate"
                                        style={{ color: currentTheme.colors.foreground }}
                                    >
                                        {entry.name}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        {entry.value}m ({percentage}%)
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
