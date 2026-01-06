'use client';

import { useMemo, useState, useCallback } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useGoalsStore } from '@/lib/store/useGoalsStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { QuarterSection } from './QuarterSection';

interface IntentYearViewProps {
    onEditGoal?: (goal: any) => void;
    onCreateGoal?: (date?: Date) => void;
}

/**
 * IntentYearView - Year-at-a-glance goals calendar
 * Quarter-based layout with compact month grids
 */
export function IntentYearView({ onEditGoal, onCreateGoal }: IntentYearViewProps) {
    const { selectedDate, setSelectedDate } = useCalendarViewStore();
    const { goals } = useGoalsStore();
    const { currentTheme } = useTheme();

    const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const currentYear = selectedDate.getFullYear();

    // Get all goals for the year - memoize with specific dependencies
    const yearGoals = useMemo(() => {
        const start = `${currentYear}-01-01`;
        const end = `${currentYear}-12-31`;
        return goals.filter((goal) => {
            return goal.start_date <= end && goal.end_date >= start;
        });
    }, [goals, currentYear]);

    // Count yearly goals (365d period)
    const yearlyGoalsCount = yearGoals.filter(g => g.period === '365d' && g.status === 'active').length;

    const handlePrevYear = () => {
        setSelectedDate(new Date(currentYear - 1, 0, 1));
    };

    const handleNextYear = () => {
        setSelectedDate(new Date(currentYear + 1, 0, 1));
    };

    const handleDayClick = useCallback((date: Date) => {
        setSelectedDay(date);
        // Could open a drawer/modal here
        onCreateGoal?.(date);
    }, [onCreateGoal]);

    const handleMonthClick = useCallback((monthIndex: number) => {
        // Navigate to monthly view for that month
        setSelectedDate(new Date(currentYear, monthIndex, 1));
        // The parent IntentCalendar should switch to month view
        // This could be handled via a callback if needed
    }, [currentYear, setSelectedDate]);

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

                    {/* Yearly goals badge */}
                    {yearlyGoalsCount > 0 && (
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${currentTheme.colors.accent}20`,
                                color: currentTheme.colors.accent,
                            }}
                            title={`${yearlyGoalsCount} yearly ${yearlyGoalsCount === 1 ? 'goal' : 'goals'}`}
                        >
                            <Target className="w-4 h-4" />
                            <span>{yearlyGoalsCount} Yearly</span>
                        </div>
                    )}
                </div>

                {/* Legend - simple inline version */}
                <div className="flex items-center gap-4 text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTheme.colors.accent }}
                        />
                        <span>Goal days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded border-2"
                            style={{ borderColor: currentTheme.colors.primary }}
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
                        goals={yearGoals}
                        hoveredGoalId={hoveredGoalId}
                        onDayClick={handleDayClick}
                        onMonthClick={handleMonthClick}
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
                {yearGoals.length > 0 ? (
                    <span>
                        {yearGoals.filter(g => g.status === 'active').length} active {yearGoals.filter(g => g.status === 'active').length === 1 ? 'goal' : 'goals'} in {currentYear}
                    </span>
                ) : (
                    <span>No goals set for {currentYear}</span>
                )}
            </div>
        </div>
    );
}
