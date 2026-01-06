'use client';

import { useMemo, memo } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Goal } from '@/lib/store/useGoalsStore';

interface CompactMonthGridProps {
    year: number;
    month: number; // 0-11 (JS month)
    goals: Goal[];
    hoveredGoalId: string | null;
    onDayClick?: (date: Date) => void;
    onMonthClick?: () => void;
}

/**
 * CompactMonthGrid - Compact month display for yearly calendar
 * Shows day numbers with subtle goal indicators
 * Memoized for performance
 */
export const CompactMonthGrid = memo(function CompactMonthGrid({
    year,
    month,
    goals,
    hoveredGoalId,
    onDayClick,
    onMonthClick
}: CompactMonthGridProps) {
    const { currentTheme } = useTheme();

    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    // Generate days for this month
    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const startDay = firstDay.getDay();
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const result: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            result.push(null);
        }

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            result.push(new Date(year, month, i));
        }

        return result;
    }, [year, month]);

    const hasGoals = (day: Date) => {
        const dayStr = day.toISOString().split('T')[0];
        return goals.some((goal) => goal.start_date <= dayStr && goal.end_date >= dayStr);
    };

    const isHighlighted = (day: Date) => {
        if (!hoveredGoalId) return false;
        const goal = goals.find(g => g.id === hoveredGoalId);
        if (!goal) return false;
        const dayStr = day.toISOString().split('T')[0];
        return goal.start_date <= dayStr && goal.end_date >= dayStr;
    };

    const isToday = (day: Date) => {
        const today = new Date();
        return day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
    };

    return (
        <div
            className="rounded-lg border overflow-hidden"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Month header */}
            <button
                onClick={onMonthClick}
                className="w-full p-2 text-center font-semibold text-xs hover:bg-opacity-5 transition-colors"
                style={{
                    backgroundColor: currentTheme.colors.muted,
                    color: currentTheme.colors.foreground,
                    borderBottom: `1px solid ${currentTheme.colors.border}`,
                }}
            >
                {monthName}
            </button>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div
                        key={idx}
                        className="text-center text-[10px] py-1"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0">
                {days.map((day, index) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="aspect-square"
                                style={{ backgroundColor: `${currentTheme.colors.muted}20` }}
                            />
                        );
                    }

                    const highlighted = isHighlighted(day);
                    const today = isToday(day);
                    const hasGoalIndicator = hasGoals(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDayClick?.(day)}
                            className="aspect-square flex flex-col items-center justify-center text-[11px] relative hover:bg-opacity-10 transition-colors"
                            style={{
                                backgroundColor: highlighted
                                    ? `${currentTheme.colors.accent}20`
                                    : today
                                        ? `${currentTheme.colors.primary}15`
                                        : 'transparent',
                                color: today
                                    ? currentTheme.colors.primary
                                    : currentTheme.colors.foreground,
                                fontWeight: today ? 'bold' : 'normal',
                                borderRight: (index + 1) % 7 !== 0 ? `1px solid ${currentTheme.colors.border}20` : 'none',
                                borderBottom: index < days.length - 7 ? `1px solid ${currentTheme.colors.border}20` : 'none',
                            }}
                        >
                            <span>{day.getDate()}</span>
                            {/* Goal indicator dot */}
                            {hasGoalIndicator && (
                                <div
                                    className="w-1 h-1 rounded-full mt-0.5"
                                    style={{ backgroundColor: currentTheme.colors.accent }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
