'use client';

import { useMemo, useState } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface YearViewProps {
    onEditTask: (task: any) => void;
    onDateClick?: (date: Date) => void;
}

/**
 * YearView - Year-at-a-glance task calendar
 * Quarter-based layout with compact month grids showing task indicators
 */
export function YearView({ onEditTask, onDateClick }: YearViewProps) {
    const { selectedDate, setSelectedDate, setView } = useCalendarViewStore();
    const { tasks } = useTaskStore();
    const { currentTheme } = useTheme();

    const currentYear = selectedDate.getFullYear();
    const today = new Date();

    // Get task count for a specific day
    const getTaskCountForDay = (date: Date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            return taskStart >= dayStart && taskStart <= dayEnd;
        }).length;
    };

    // Count tasks for the year
    const yearTasksCount = useMemo(() => {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            return taskStart >= yearStart && taskStart <= yearEnd;
        }).length;
    }, [tasks, currentYear]);

    const handlePrevYear = () => {
        setSelectedDate(new Date(currentYear - 1, 0, 1));
    };

    const handleNextYear = () => {
        setSelectedDate(new Date(currentYear + 1, 0, 1));
    };

    const handleMonthClick = (monthIndex: number) => {
        setSelectedDate(new Date(currentYear, monthIndex, 1));
        setView('month');
    };

    return (
        <div className="space-y-6">
            {/* Year header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevYear}
                            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {currentYear}
                        </h1>
                        <button
                            onClick={handleNextYear}
                            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Year tasks badge */}
                    {yearTasksCount > 0 && (
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${currentTheme.colors.primary}20`,
                                color: currentTheme.colors.primary,
                            }}
                            title={`${yearTasksCount} ${yearTasksCount === 1 ? 'task' : 'tasks'} in ${currentYear}`}
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>{yearTasksCount} Tasks</span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                        />
                        <span>Task days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded border-2"
                            style={{ borderColor: currentTheme.colors.accent }}
                        />
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Quarters */}
            <div className="space-y-6">
                {[1, 2, 3, 4].map((quarter) => (
                    <QuarterSection
                        key={quarter}
                        quarter={quarter as 1 | 2 | 3 | 4}
                        year={currentYear}
                        getTaskCountForDay={getTaskCountForDay}
                        onMonthClick={handleMonthClick}
                        theme={currentTheme}
                        today={today}
                    />
                ))}
            </div>

            {/* Summary at bottom */}
            <div
                className="text-center text-sm p-4 rounded-lg"
                style={{
                    backgroundColor: `${currentTheme.colors.muted}40`,
                    color: currentTheme.colors.mutedForeground,
                }}
            >
                {yearTasksCount > 0 ? (
                    <span>
                        {yearTasksCount} {yearTasksCount === 1 ? 'task' : 'tasks'} scheduled in {currentYear}
                    </span>
                ) : (
                    <span>No tasks scheduled for {currentYear}</span>
                )}
            </div>
        </div>
    );
}

/* Quarter Section Component */
interface QuarterSectionProps {
    quarter: 1 | 2 | 3 | 4;
    year: number;
    getTaskCountForDay: (date: Date) => number;
    onMonthClick: (monthIndex: number) => void;
    theme: any;
    today: Date;
}

function QuarterSection({ quarter, year, getTaskCountForDay, onMonthClick, theme, today }: QuarterSectionProps) {
    const monthsInQuarter = [(quarter - 1) * 3, (quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2];

    return (
        <div
            className="rounded-xl border p-4"
            style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
            }}
        >
            <h2
                className="text-lg font-bold mb-4"
                style={{ color: theme.colors.foreground }}
            >
                Q{quarter}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthsInQuarter.map((monthIndex) => (
                    <CompactMonthGrid
                        key={monthIndex}
                        monthIndex={monthIndex}
                        year={year}
                        getTaskCountForDay={getTaskCountForDay}
                        onMonthClick={onMonthClick}
                        theme={theme}
                        today={today}
                    />
                ))}
            </div>
        </div>
    );
}

/* Compact Month Grid Component */
interface CompactMonthGridProps {
    monthIndex: number;
    year: number;
    getTaskCountForDay: (date: Date) => number;
    onMonthClick: (monthIndex: number) => void;
    theme: any;
    today: Date;
}

function CompactMonthGrid({ monthIndex, year, getTaskCountForDay, onMonthClick, theme, today }: CompactMonthGridProps) {
    const monthName = new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' });

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, monthIndex, 1);
        const startDay = firstDay.getDay();
        const lastDay = new Date(year, monthIndex + 1, 0);
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Add padding
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, monthIndex, i));
        }

        return days;
    }, [year, monthIndex]);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer rounded-lg p-3 transition-all"
            style={{
                backgroundColor: `${theme.colors.muted}30`,
            }}
            onClick={() => onMonthClick(monthIndex)}
        >
            <h3
                className="text-sm font-semibold mb-2 text-center"
                style={{ color: theme.colors.foreground }}
            >
                {monthName}
            </h3>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div
                        key={idx}
                        className="text-[10px] text-center font-medium"
                        style={{ color: theme.colors.mutedForeground }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const taskCount = getTaskCountForDay(day);
                    const isToday = day.toDateString() === today.toDateString();

                    return (
                        <div
                            key={day.toISOString()}
                            className="aspect-square flex items-center justify-center relative text-[10px] rounded"
                            style={{
                                color: theme.colors.foreground,
                                backgroundColor: taskCount > 0 ? `${theme.colors.primary}15` : 'transparent',
                                border: isToday ? `2px solid ${theme.colors.accent}` : 'none',
                            }}
                        >
                            {day.getDate()}
                            {taskCount > 0 && (
                                <div
                                    className="absolute bottom-0.5 w-1 h-1 rounded-full"
                                    style={{ backgroundColor: theme.colors.primary }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
