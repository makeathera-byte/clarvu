'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatDuration } from '@/lib/utils/date';
import { ListChecks, Clock, Target, TrendingUp } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    duration_minutes: number | null;
    category_id: string | null;
}

interface Category {
    id: string;
    type: string;
}

interface TodayOverviewProps {
    tasks: Task[];
    categories: Category[];
}

export function TodayOverview({ tasks, categories }: TodayOverviewProps) {
    const { currentTheme } = useTheme();

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    // Calculate deep work minutes (growth + delivery categories)
    const deepWorkTypes = ['growth', 'delivery'];
    const categoryTypeMap = new Map(categories.map(c => [c.id, c.type]));

    const deepWorkMinutes = tasks
        .filter(t => t.status === 'completed')
        .filter(t => {
            const type = categoryTypeMap.get(t.category_id || '');
            return type && deepWorkTypes.includes(type);
        })
        .reduce((acc, t) => acc + (t.duration_minutes || 30), 0);

    // Completion rate
    const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const stats = [
        {
            label: 'Total Tasks',
            value: totalTasks.toString(),
            icon: ListChecks,
            color: currentTheme.colors.foreground,
            bgColor: currentTheme.colors.muted,
        },
        {
            label: 'Completed',
            value: completedTasks.toString(),
            icon: Target,
            color: currentTheme.colors.primary,
            bgColor: `${currentTheme.colors.primary}15`,
        },
        {
            label: 'Deep Work',
            value: formatDuration(deepWorkMinutes),
            icon: Clock,
            color: currentTheme.colors.accent,
            bgColor: `${currentTheme.colors.accent}15`,
        },
        {
            label: 'Progress',
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: inProgressTasks > 0 ? '#f59e0b' : currentTheme.colors.mutedForeground,
            bgColor: inProgressTasks > 0 ? '#f59e0b15' : currentTheme.colors.muted,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative overflow-hidden p-5 rounded-2xl border backdrop-blur-sm"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            {/* Background gradient */}
                            <div
                                className="absolute inset-0 opacity-50"
                                style={{
                                    background: `linear-gradient(135deg, ${stat.bgColor} 0%, transparent 60%)`,
                                }}
                            />

                            <div className="relative">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ backgroundColor: stat.bgColor }}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: stat.color }}
                                    />
                                </div>

                                {/* Value */}
                                <p
                                    className="text-2xl font-bold"
                                    style={{ color: stat.color }}
                                >
                                    {stat.value}
                                </p>

                                {/* Label */}
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
