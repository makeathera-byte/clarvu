'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Users, ListTodo, Timer, Calendar, Activity, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        totalUsers: number;
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        totalTasks: number;
        todayTimers: number;
        calendarConnections: number;
    };
}

const statConfig = [
    { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#3b82f6' },
    { key: 'dailyActiveUsers', label: 'Daily Active', icon: Activity, color: '#22c55e' },
    { key: 'weeklyActiveUsers', label: 'Weekly Active', icon: TrendingUp, color: '#8b5cf6' },
    { key: 'totalTasks', label: 'Total Tasks', icon: ListTodo, color: '#f59e0b' },
    { key: 'todayTimers', label: 'Timers Today', icon: Timer, color: '#ef4444' },
    { key: 'calendarConnections', label: 'Calendar Syncs', icon: Calendar, color: '#06b6d4' },
];

export function StatsCards({ stats }: StatsCardsProps) {
    const { currentTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
            {statConfig.map((config, index) => {
                const Icon = config.icon;
                const value = stats[config.key as keyof typeof stats];

                return (
                    <motion.div
                        key={config.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="p-4 rounded-2xl border backdrop-blur-sm"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            borderColor: currentTheme.colors.border,
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${config.color}15` }}
                        >
                            <Icon className="w-5 h-5" style={{ color: config.color }} />
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {value.toLocaleString()}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {config.label}
                        </p>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
