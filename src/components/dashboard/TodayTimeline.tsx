'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatTime } from '@/lib/utils/date';
import { Clock, CheckCircle2, Play, Calendar } from 'lucide-react';

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

interface TodayTimelineProps {
    tasks: Task[];
    categories: Category[];
}

export function TodayTimeline({ tasks, categories }: TodayTimelineProps) {
    const { currentTheme } = useTheme();

    // Sort tasks by start time
    const sortedTasks = [...tasks].sort((a, b) => {
        const aTime = a.start_time ? new Date(a.start_time).getTime() : 0;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : 0;
        return aTime - bTime;
    });

    // Get category by ID
    const getCategory = (categoryId: string | null) => {
        if (!categoryId) return null;
        return categories.find(c => c.id === categoryId);
    };

    // Get status icon and color
    const getStatusInfo = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return {
                    icon: CheckCircle2,
                    color: currentTheme.colors.primary,
                    label: 'Completed',
                };
            case 'in_progress':
                return {
                    icon: Play,
                    color: currentTheme.colors.accent,
                    label: 'In Progress',
                };
            case 'scheduled':
            default:
                return {
                    icon: Clock,
                    color: currentTheme.colors.mutedForeground,
                    label: 'Scheduled',
                };
        }
    };

    if (sortedTasks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="p-6 rounded-2xl border backdrop-blur-sm h-full flex flex-col"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <Calendar className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    Today&apos;s Timeline
                </h3>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        <Clock
                            className="w-8 h-8"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        />
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No tasks scheduled yet
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
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
                <Calendar className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Today&apos;s Timeline
            </h3>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div
                    className="absolute left-4 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.border }}
                />

                {/* Timeline items */}
                <div className="space-y-4">
                    {sortedTasks.map((task, index) => {
                        const category = getCategory(task.category_id);
                        const statusInfo = getStatusInfo(task.status);
                        const Icon = statusInfo.icon;

                        return (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className="relative pl-10"
                            >
                                {/* Dot */}
                                <div
                                    className="absolute left-2 top-2 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: currentTheme.colors.card,
                                        border: `2px solid ${statusInfo.color}`,
                                    }}
                                >
                                    {task.status === 'in_progress' && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: statusInfo.color }}
                                        />
                                    )}
                                    {task.status === 'completed' && (
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: statusInfo.color }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div
                                    className="p-3 rounded-xl border"
                                    style={{
                                        backgroundColor: task.status === 'in_progress'
                                            ? `${statusInfo.color}10`
                                            : 'transparent',
                                        borderTopColor: task.status === 'in_progress'
                                            ? statusInfo.color
                                            : currentTheme.colors.border,
                                        borderRightColor: task.status === 'in_progress'
                                            ? statusInfo.color
                                            : currentTheme.colors.border,
                                        borderBottomColor: task.status === 'in_progress'
                                            ? statusInfo.color
                                            : currentTheme.colors.border,
                                        borderLeftWidth: category ? '3px' : '1px',
                                        borderLeftColor: category ? category.color : currentTheme.colors.border,
                                    }}
                                >
                                    {/* Category indicator with dot */}
                                    {category && (
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span
                                                className="text-xs"
                                                style={{ color: category.color }}
                                            >
                                                {category.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <p
                                        className="font-medium text-sm truncate"
                                        style={{
                                            color: task.status === 'completed'
                                                ? currentTheme.colors.mutedForeground
                                                : currentTheme.colors.foreground,
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                        }}
                                    >
                                        {task.title}
                                    </p>

                                    {/* Time and status */}
                                    <div className="flex items-center justify-between mt-1">
                                        <span
                                            className="text-xs"
                                            style={{ color: currentTheme.colors.mutedForeground }}
                                        >
                                            {formatTime(task.start_time)}
                                            {task.end_time && ` → ${formatTime(task.end_time)}`}
                                            {!task.end_time && task.status === 'scheduled' && ' (scheduled)'}
                                        </span>

                                        <span
                                            className="text-xs flex items-center gap-1"
                                            style={{ color: statusInfo.color }}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
