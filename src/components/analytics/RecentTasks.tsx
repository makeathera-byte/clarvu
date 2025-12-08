'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface RecentTasksProps {
    tasks: Task[];
    categories: Category[];
}

export function RecentTasks({ tasks, categories }: RecentTasksProps) {
    const { currentTheme } = useTheme();

    // Get last 20 tasks
    const recentTasks = tasks.slice(0, 20);

    // Get category by ID
    const getCategory = (categoryId: string | null) => {
        if (!categoryId) return null;
        return categories.find(c => c.id === categoryId);
    };

    // Get status info
    const getStatusInfo = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return {
                    icon: CheckCircle2,
                    color: '#22c55e',
                    label: 'Completed',
                };
            case 'in_progress':
                return {
                    icon: Clock,
                    color: currentTheme.colors.accent,
                    label: 'In Progress',
                };
            case 'scheduled':
            default:
                return {
                    icon: AlertCircle,
                    color: currentTheme.colors.mutedForeground,
                    label: 'Scheduled',
                };
        }
    };

    if (recentTasks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="p-6 rounded-2xl border backdrop-blur-sm"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <History className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    Recent Tasks
                </h3>

                <div className="text-center py-8">
                    <History
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No tasks in the last 30 days
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm"
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
                <History className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Recent Tasks
            </h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr
                            className="border-b"
                            style={{ borderColor: currentTheme.colors.border }}
                        >
                            <th
                                className="text-left py-3 px-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Title
                            </th>
                            <th
                                className="text-left py-3 px-2 text-sm font-medium hidden sm:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Category
                            </th>
                            <th
                                className="text-left py-3 px-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Status
                            </th>
                            <th
                                className="text-left py-3 px-2 text-sm font-medium hidden md:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Time
                            </th>
                            <th
                                className="text-right py-3 px-2 text-sm font-medium hidden lg:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Duration
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTasks.map((task, index) => {
                            const category = getCategory(task.category_id);
                            const statusInfo = getStatusInfo(task.status);
                            const Icon = statusInfo.icon;

                            return (
                                <motion.tr
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.02 }}
                                    className="border-b"
                                    style={{ borderColor: currentTheme.colors.border }}
                                >
                                    {/* Title */}
                                    <td
                                        className="py-3 px-2 max-w-[200px]"
                                        style={{ color: currentTheme.colors.foreground }}
                                    >
                                        <span className="truncate block">{task.title}</span>
                                    </td>

                                    {/* Category */}
                                    <td className="py-3 px-2 hidden sm:table-cell">
                                        {category ? (
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${category.color}20`,
                                                    color: category.color,
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        ) : (
                                            <span
                                                className="text-xs"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                —
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-2">
                                        <span
                                            className="inline-flex items-center gap-1 text-xs font-medium"
                                            style={{ color: statusInfo.color }}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                    </td>

                                    {/* Time */}
                                    <td
                                        className="py-3 px-2 text-sm hidden md:table-cell"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        {formatTime(task.start_time)}
                                        {task.end_time && ` → ${formatTime(task.end_time)}`}
                                    </td>

                                    {/* Duration */}
                                    <td
                                        className="py-3 px-2 text-right text-sm hidden lg:table-cell"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        {formatDuration(task.duration_minutes)}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
