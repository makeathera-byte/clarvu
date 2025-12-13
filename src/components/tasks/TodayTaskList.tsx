'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { startTaskAction } from '@/app/dashboard/actions';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { Play, Eye, Clock, CheckCircle2, Circle } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    category?: Category | null;
}

interface TodayTaskListProps {
    tasks: Task[];
    categories: Category[];
    compact?: boolean;
}

export function TodayTaskList({ tasks, categories, compact = false }: TodayTaskListProps) {
    const { currentTheme } = useTheme();
    const { startTaskTimer, taskId: activeTaskId } = useTimerStore();

    // Sort tasks: in_progress first, then scheduled, then completed
    const sortedTasks = [...tasks].sort((a, b) => {
        const order = { in_progress: 0, scheduled: 1, completed: 2 };
        return order[a.status] - order[b.status];
    });

    // Get category for a task
    const getCategory = (categoryId: string | null) => {
        if (!categoryId) return null;
        return categories.find(c => c.id === categoryId);
    };

    // Format time
    const formatTime = (isoString: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Handle starting a task
    const handleStartTask = async (task: Task) => {
        const result = await startTaskAction(task.id);
        if (result.success) {
            startTaskTimer(task.id, task.title, 30 * 60);
        }
    };

    // Handle viewing timer
    const handleViewTimer = (task: Task) => {
        startTaskTimer(task.id, task.title, 30 * 60);
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-8">
                <Circle
                    className="w-10 h-10 mx-auto mb-3"
                    style={{ color: currentTheme.colors.mutedForeground, opacity: 0.5 }}
                />
                <p
                    className="text-sm"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    No tasks yet. Create one above!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {sortedTasks.map((task, index) => {
                const category = getCategory(task.category_id);
                const isActiveTimer = activeTaskId === task.id;
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in_progress';

                return (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${compact ? '' : 'hover:scale-[1.01]'}`}
                        style={{
                            backgroundColor: isActiveTimer
                                ? `${currentTheme.colors.primary}08`
                                : isInProgress
                                    ? `${currentTheme.colors.accent}05`
                                    : 'transparent',
                        }}
                    >
                        {/* Status Indicator */}
                        <div className="shrink-0">
                            {isCompleted ? (
                                <CheckCircle2
                                    className="w-5 h-5"
                                    style={{ color: currentTheme.colors.primary }}
                                />
                            ) : isInProgress ? (
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <div
                                        className="w-5 h-5 rounded-full border-2"
                                        style={{
                                            borderColor: currentTheme.colors.accent,
                                            backgroundColor: `${currentTheme.colors.accent}30`,
                                        }}
                                    />
                                </motion.div>
                            ) : (
                                <Circle
                                    className="w-5 h-5"
                                    style={{ color: currentTheme.colors.border }}
                                />
                            )}
                        </div>

                        {/* Task Title */}
                        <span
                            className={`flex-1 text-sm truncate ${isCompleted ? 'line-through' : ''}`}
                            style={{
                                color: isCompleted
                                    ? currentTheme.colors.mutedForeground
                                    : currentTheme.colors.foreground,
                            }}
                        >
                            {task.title}
                        </span>

                        {/* Category Dot */}
                        {category && (
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: category.color }}
                                title={category.name}
                            />
                        )}

                        {/* Time */}
                        {task.start_time && (
                            <span
                                className="text-xs shrink-0"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                {formatTime(task.start_time)}
                            </span>
                        )}

                        {/* Action Button */}
                        {!isCompleted && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                {task.status === 'scheduled' && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartTask(task);
                                        }}
                                        className="p-1.5 rounded-lg"
                                        style={{
                                            backgroundColor: currentTheme.colors.primary,
                                            color: currentTheme.colors.primaryForeground,
                                        }}
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                    </motion.button>
                                )}

                                {isInProgress && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewTimer(task);
                                        }}
                                        className="p-1.5 rounded-lg"
                                        style={{
                                            backgroundColor: currentTheme.colors.accent,
                                            color: '#fff',
                                        }}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
