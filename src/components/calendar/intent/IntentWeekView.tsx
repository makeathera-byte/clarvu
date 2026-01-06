'use client';

import { useMemo } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useGoalsStore } from '@/lib/store/useGoalsStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { GoalBlock } from './GoalBlock';

interface IntentWeekViewProps {
    onEditGoal?: (goal: any) => void;
}

/**
 * Intent Week View
 * Shows 7 days with goals and agenda blocks
 * Focused on high-level planning and intent
 */
export function IntentWeekView({ onEditGoal }: IntentWeekViewProps) {
    const { selectedDate } = useCalendarViewStore();
    const { getGoalsInDateRange } = useGoalsStore();
    const { currentTheme } = useTheme();

    // Generate week days
    const weekDays = useMemo(() => {
        const days: Date[] = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }, [selectedDate]);

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const goals = useMemo(() => getGoalsInDateRange(weekStart, weekEnd), [weekStart, weekEnd, getGoalsInDateRange]);

    return (
        <div
            className="rounded-xl border overflow-hidden shadow-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Week header */}
            <div
                className="grid grid-cols-7 border-b"
                style={{ borderColor: currentTheme.colors.border }}
            >
                {weekDays.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={day.toISOString()}
                            className="p-4 text-center"
                            style={{
                                borderRight: idx < 6 ? `1px solid ${currentTheme.colors.border}` : 'none',
                                backgroundColor: isToday ? `${currentTheme.colors.primary}10` : 'transparent',
                            }}
                        >
                            <div
                                className="text-xs font-medium uppercase"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div
                                className="text-2xl font-bold mt-1"
                                style={{ color: isToday ? currentTheme.colors.primary : currentTheme.colors.foreground }}
                            >
                                {day.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Week content - Goals and Agenda Blocks */}
            <div className="p-6 space-y-6 min-h-[400px]">
                {/* Goals Section */}
                {goals.length > 0 && (
                    <div>
                        <h3
                            className="text-sm font-semibold mb-3 uppercase tracking-wide"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Active Goals
                        </h3>
                        <div className="space-y-3">
                            {goals.map((goal) => (
                                <GoalBlock
                                    key={goal.id}
                                    goal={goal}
                                    onClick={() => onEditGoal?.(goal)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {goals.length === 0 && (
                    <div
                        className="text-center py-16 rounded-xl"
                        style={{
                            backgroundColor: `${currentTheme.colors.muted}40`,
                            color: currentTheme.colors.mutedForeground,
                        }}
                    >
                        <p className="text-lg font-medium">No goals yet</p>
                        <p className="text-sm mt-2">Start planning your week with strategic goals</p>
                    </div>
                )}
            </div>
        </div>
    );
}
