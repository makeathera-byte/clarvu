'use client';

import { useMemo, useState } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface MonthViewProps {
    onEditTask: (task: any) => void;
}

export function MonthView({ onEditTask }: MonthViewProps) {
    const { selectedDate } = useCalendarViewStore();
    const { tasks } = useTaskStore();
    const { currentTheme } = useTheme();
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay(); // 0 = Sunday

        // Last day of month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Generate array of dates including padding
        const days: (Date | null)[] = [];

        // Add padding for days before month starts
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [selectedDate]);

    // Get tasks for a specific day
    const getTasksForDay = (day: Date) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            return taskStart >= dayStart && taskStart <= dayEnd;
        });
    };

    // Get category colors for a day
    const getCategoryColors = (day: Date) => {
        const dayTasks = getTasksForDay(day);
        const colors = new Set<string>();
        dayTasks.forEach((task: any) => {
            if (task.category_color) {
                colors.add(task.category_color);
            }
        });
        return Array.from(colors).slice(0, 4); // Max 4 dots
    };

    const isToday = (day: Date) => {
        return day.toDateString() === new Date().toDateString();
    };

    const handleDayClick = (day: Date) => {
        const dayStr = day.toDateString();
        setExpandedDate(expandedDate === dayStr ? null : dayStr);
    };

    return (
        <div
            className="rounded-xl border overflow-hidden shadow-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Weekday headers */}
            <div
                className="grid grid-cols-7"
                style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
            >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                    <div
                        key={day}
                        className="p-3 text-center text-sm font-semibold"
                        style={{
                            color: currentTheme.colors.mutedForeground,
                            borderRight: idx < 6 ? `1px solid ${currentTheme.colors.border}` : 'none',
                            backgroundColor: currentTheme.colors.muted,
                        }}
                    >
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 3)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="aspect-square"
                                style={{
                                    borderRight: (index + 1) % 7 !== 0 ? `1px solid ${currentTheme.colors.border}` : 'none',
                                    borderBottom: `1px solid ${currentTheme.colors.border}`,
                                    backgroundColor: `${currentTheme.colors.muted}30`,
                                }}
                            />
                        );
                    }

                    const dayTasks = getTasksForDay(day);
                    const colors = getCategoryColors(day);
                    const isSelectedDay = isToday(day);
                    const isExpanded = expandedDate === day.toDateString();

                    return (
                        <div
                            key={day.toISOString()}
                            style={{
                                borderRight: (index + 1) % 7 !== 0 ? `1px solid ${currentTheme.colors.border}` : 'none',
                                borderBottom: `1px solid ${currentTheme.colors.border}`,
                            }}
                        >
                            <motion.button
                                onClick={() => handleDayClick(day)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full min-h-[80px] p-3 text-left transition-all duration-200"
                                style={{
                                    backgroundColor: isSelectedDay
                                        ? `${currentTheme.colors.primary}15`
                                        : isExpanded
                                            ? currentTheme.colors.muted
                                            : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelectedDay && !isExpanded) {
                                        e.currentTarget.style.backgroundColor = `${currentTheme.colors.muted}50`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelectedDay && !isExpanded) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span
                                        className="text-sm font-bold flex items-center gap-1"
                                        style={{
                                            color: isSelectedDay ? currentTheme.colors.primary : currentTheme.colors.foreground
                                        }}
                                    >
                                        {day.getDate()}
                                        {isExpanded && (
                                            <ChevronUp className="w-3 h-3" style={{ color: currentTheme.colors.mutedForeground }} />
                                        )}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <span
                                            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: `${currentTheme.colors.primary}20`,
                                                color: currentTheme.colors.primary,
                                            }}
                                        >
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>

                                {/* Color indicators */}
                                {colors.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.button>

                            {/* Expanded day timeline */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="col-span-7 p-4"
                                        style={{
                                            borderTop: `1px solid ${currentTheme.colors.border}`,
                                            backgroundColor: `${currentTheme.colors.muted}80`,
                                        }}
                                    >
                                        <h3
                                            className="text-base font-bold mb-3 flex items-center gap-2"
                                            style={{ color: currentTheme.colors.foreground }}
                                        >
                                            <Clock className="w-4 h-4" />
                                            {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </h3>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {dayTasks.length > 0 ? (
                                                dayTasks.map((task: any) => (
                                                    <motion.button
                                                        key={task.id}
                                                        onClick={() => onEditTask(task)}
                                                        whileHover={{ scale: 1.02, x: 4 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 shadow-sm"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.card,
                                                            borderLeft: `4px solid ${task.category_color || currentTheme.colors.primary}`,
                                                        }}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div
                                                                className="text-sm font-semibold truncate"
                                                                style={{ color: currentTheme.colors.foreground }}
                                                            >
                                                                {task.title}
                                                            </div>
                                                            <div
                                                                className="text-xs mt-1 flex items-center gap-2"
                                                                style={{ color: currentTheme.colors.mutedForeground }}
                                                            >
                                                                {task.start_time && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {new Date(task.start_time).toLocaleTimeString('en-US', {
                                                                            hour: 'numeric',
                                                                            minute: '2-digit',
                                                                            hour12: true,
                                                                        })}
                                                                    </span>
                                                                )}
                                                                {task.category_name && (
                                                                    <span
                                                                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: `${task.category_color}20`,
                                                                            color: task.category_color,
                                                                        }}
                                                                    >
                                                                        {task.category_name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="text-xs px-2.5 py-1 rounded-md font-medium"
                                                            style={{
                                                                backgroundColor:
                                                                    task.priority === 'high' ? '#fef2f2' :
                                                                        task.priority === 'medium' ? '#fffbeb' : '#f9fafb',
                                                                color:
                                                                    task.priority === 'high' ? '#991b1b' :
                                                                        task.priority === 'medium' ? '#92400e' : '#374151',
                                                            }}
                                                        >
                                                            {task.priority || 'medium'}
                                                        </div>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <div
                                                    className="text-sm text-center py-8 rounded-lg"
                                                    style={{
                                                        color: currentTheme.colors.mutedForeground,
                                                        backgroundColor: currentTheme.colors.card,
                                                    }}
                                                >
                                                    No tasks for this day
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
