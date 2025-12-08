'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatDuration } from '@/lib/utils/date';
import { ListChecks, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react';

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

interface StatsSummaryProps {
    todayTasks: Task[];
    yesterdayTasks: Task[];
    categories: Category[];
}

export function StatsSummary({ todayTasks, yesterdayTasks, categories }: StatsSummaryProps) {
    const { currentTheme } = useTheme();

    // Deep work category types
    const deepWorkTypes = ['growth', 'delivery'];
    const categoryTypeMap = new Map(categories.map(c => [c.id, c.type]));

    // Calculate today's metrics
    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter(t => t.status === 'completed').length;

    const deepWorkTodayMinutes = todayTasks
        .filter(t => t.status === 'completed')
        .filter(t => {
            const type = categoryTypeMap.get(t.category_id || '');
            return type && deepWorkTypes.includes(type);
        })
        .reduce((acc, t) => acc + (t.duration_minutes || 30), 0);

    // Calculate yesterday's deep work for comparison
    const deepWorkYesterdayMinutes = yesterdayTasks
        .filter(t => t.status === 'completed')
        .filter(t => {
            const type = categoryTypeMap.get(t.category_id || '');
            return type && deepWorkTypes.includes(type);
        })
        .reduce((acc, t) => acc + (t.duration_minutes || 30), 0);

    // Calculate percentage change
    const percentChange = deepWorkYesterdayMinutes > 0
        ? Math.round(((deepWorkTodayMinutes - deepWorkYesterdayMinutes) / deepWorkYesterdayMinutes) * 100)
        : deepWorkTodayMinutes > 0 ? 100 : 0;

    const isPositive = percentChange >= 0;

    const stats = [
        {
            label: 'Tasks Today',
            value: totalToday.toString(),
            icon: ListChecks,
            color: currentTheme.colors.foreground,
            bgColor: currentTheme.colors.muted,
        },
        {
            label: 'Completed',
            value: completedToday.toString(),
            icon: CheckCircle2,
            color: currentTheme.colors.primary,
            bgColor: `${currentTheme.colors.primary}15`,
        },
        {
            label: 'Deep Work',
            value: formatDuration(deepWorkTodayMinutes),
            icon: Clock,
            color: currentTheme.colors.accent,
            bgColor: `${currentTheme.colors.accent}15`,
        },
        {
            label: 'vs Yesterday',
            value: `${isPositive ? '+' : ''}${percentChange}%`,
            icon: isPositive ? TrendingUp : TrendingDown,
            color: isPositive ? '#22c55e' : '#ef4444',
            bgColor: isPositive ? '#22c55e15' : '#ef444415',
            description: isPositive ? 'More deep work' : 'Less deep work',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
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
                                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>

                            {/* Value */}
                            <p className="text-2xl font-bold" style={{ color: stat.color }}>
                                {stat.value}
                            </p>

                            {/* Label */}
                            <p className="text-sm mt-1" style={{ color: currentTheme.colors.mutedForeground }}>
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
