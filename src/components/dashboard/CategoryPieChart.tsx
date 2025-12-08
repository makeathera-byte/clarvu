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
}

interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface CategoryPieChartProps {
    tasks: Task[];
    categories: Category[];
}

export function CategoryPieChart({ tasks, categories }: CategoryPieChartProps) {
    const { currentTheme } = useTheme();

    // Group completed tasks by category and sum duration
    const categoryMap = new Map(categories.map(c => [c.id, c]));

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
            return acc + 30; // Default to 30 minutes
        }, 0);

        return {
            name: cat.name,
            value: totalMinutes,
            color: cat.color,
        };
    }).filter(d => d.value > 0);

    // Add "Uncategorized" for tasks without category
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
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-5 rounded-xl border backdrop-blur-sm"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h3
                    className="text-sm font-semibold mb-4 flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <PieChartIcon className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                    Category Breakdown
                </h3>

                <div className="flex flex-col items-center justify-center py-6">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        <PieChartIcon
                            className="w-7 h-7"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        />
                    </div>
                    <p className="text-sm font-medium" style={{ color: currentTheme.colors.mutedForeground }}>
                        No activity yet
                    </p>
                    <p className="text-xs mt-1" style={{ color: currentTheme.colors.mutedForeground, opacity: 0.7 }}>
                        Complete tasks to see your breakdown
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="p-3 rounded-xl border backdrop-blur-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <h3
                className="text-xs font-semibold mb-2 flex items-center gap-2"
                style={{ color: currentTheme.colors.foreground }}
            >
                <PieChartIcon className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                Category Breakdown
            </h3>

            <div className="flex items-center gap-3">
                {/* Chart */}
                <motion.div
                    className="w-20 h-20 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={18}
                                outerRadius={35}
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
                <div className="flex-1 space-y-1">
                    {categoryData.map((entry, index) => {
                        const percentage = totalMinutes > 0
                            ? Math.round((entry.value / totalMinutes) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={`legend-${index}`}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span
                                    className="text-xs flex-1 truncate"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    {entry.name}
                                </span>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {percentage}%
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
