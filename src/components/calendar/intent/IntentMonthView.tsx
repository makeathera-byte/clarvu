'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useGoalsStore } from '@/lib/store/useGoalsStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { MonthlyGoalsList } from './MonthlyGoalsList';
import { MonthlyFocusEditor } from './MonthlyFocusEditor';
import { MonthlyContext } from './MonthlyContext';
import { GoalBlock } from './GoalBlock';
import { getMonthlyFocus, updateMonthlyFocus } from '@/app/calendar/actions/monthlyFocusActions';

interface IntentMonthViewProps {
    onEditGoal?: (goal: any) => void;
    onCreateGoal?: (date?: Date) => void;
}

/**
 * Enhanced Intent Month View - Goals Only
 * Two-panel layout: Left sidebar with goals/focus + Right calendar grid
 */
export function IntentMonthView({ onEditGoal, onCreateGoal }: IntentMonthViewProps) {
    const { selectedDate } = useCalendarViewStore();
    const { getGoalsInDateRange } = useGoalsStore();
    const { currentTheme } = useTheme();

    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);
    const [monthlyFocus, setMonthlyFocus] = useState('');
    const [isLoadingFocus, setIsLoadingFocus] = useState(true);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // 1-indexed for server

    // Load monthly focus
    useEffect(() => {
        const loadFocus = async () => {
            setIsLoadingFocus(true);
            const { focus } = await getMonthlyFocus(year, month);
            setMonthlyFocus(focus || '');
            setIsLoadingFocus(false);
        };
        loadFocus();
    }, [year, month]);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1);
        const startDay = firstDay.getDay();
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month - 1, i));
        }
        return days;
    }, [year, month]);

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const currentMonthGoals = useMemo(() => getGoalsInDateRange(monthStart, monthEnd), [monthStart, monthEnd, getGoalsInDateRange]);

    // Get hovered goal to highlight days
    const hoveredGoal = hoveredGoalId ? currentMonthGoals.find(g => g.id === hoveredGoalId) : null;

    const isToday = (day: Date) => day.toDateString() === new Date().toDateString();

    const hasGoals = (day: Date) => {
        const dayStr = day.toISOString().split('T')[0];
        return currentMonthGoals.some((goal) => goal.start_date <= dayStr && goal.end_date >= dayStr);
    };

    const isHighlighted = (day: Date) => {
        if (!hoveredGoal) return false;
        const dayStr = day.toISOString().split('T')[0];
        return hoveredGoal.start_date <= dayStr && hoveredGoal.end_date >= dayStr;
    };

    const handleSaveFocus = async (focus: string) => {
        await updateMonthlyFocus(year, month, focus);
    };

    return (
        <div className="flex gap-6">
            {/* LEFT PANEL - Fixed width sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
                {/* Monthly Goals Section */}
                <div>
                    <h2
                        className="text-xs font-semibold uppercase tracking-wide mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Goals This Month
                    </h2>
                    <MonthlyGoalsList
                        goals={currentMonthGoals}
                        onGoalClick={(goal) => onEditGoal?.(goal)}
                        onGoalHover={setHoveredGoalId}
                        hoveredGoalId={hoveredGoalId}
                    />
                </div>

                {/* Monthly Focus Section */}
                <div>
                    {!isLoadingFocus && (
                        <MonthlyFocusEditor
                            initialFocus={monthlyFocus}
                            onSave={handleSaveFocus}
                            year={year}
                            month={month}
                        />
                    )}
                </div>

                {/* Monthly Context Section */}
                <div>
                    <h3
                        className="text-xs font-semibold uppercase tracking-wide mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Monthly Context
                    </h3>
                    <MonthlyContext
                        currentMonthGoals={currentMonthGoals}
                    />
                </div>
            </div>

            {/* RIGHT PANEL - Calendar Grid */}
            <div
                className="flex-1 rounded-xl border overflow-hidden shadow-sm"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                {/* Weekday headers */}
                <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <div
                            key={day}
                            className="p-2 text-center text-xs font-semibold"
                            style={{
                                color: currentTheme.colors.mutedForeground,
                                borderRight: idx < 6 ? `1px solid ${currentTheme.colors.border}` : 'none',
                                backgroundColor: currentTheme.colors.muted,
                            }}
                        >
                            {day}
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
                                    className="aspect-square min-h-[80px]"
                                    style={{
                                        borderRight: (index + 1) % 7 !== 0 ? `1px solid ${currentTheme.colors.border}` : 'none',
                                        borderBottom: `1px solid ${currentTheme.colors.border}`,
                                        backgroundColor: `${currentTheme.colors.muted}20`,
                                    }}
                                />
                            );
                        }

                        const isSelectedDay = isToday(day);
                        const hasGoalsOnDay = hasGoals(day);
                        const isDayHighlighted = isHighlighted(day);
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
                                    onClick={() => setExpandedDate(isExpanded ? null : day.toDateString())}
                                    whileHover={{ scale: 1.01 }}
                                    className="w-full min-h-[80px] p-3 text-left transition-all"
                                    style={{
                                        backgroundColor: isDayHighlighted
                                            ? `${currentTheme.colors.accent}15`
                                            : isSelectedDay
                                                ? `${currentTheme.colors.primary}10`
                                                : 'transparent',
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className="text-lg font-bold"
                                            style={{
                                                color: isSelectedDay ? currentTheme.colors.primary : currentTheme.colors.foreground
                                            }}
                                        >
                                            {day.getDate()}
                                        </span>
                                        {/* Goal indicator */}
                                        {hasGoalsOnDay && (
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: currentTheme.colors.accent }}
                                            />
                                        )}
                                    </div>
                                </motion.button>

                                {/* Expanded day details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="col-span-7 p-4 space-y-3"
                                            style={{
                                                borderTop: `1px solid ${currentTheme.colors.border}`,
                                                backgroundColor: `${currentTheme.colors.muted}60`,
                                            }}
                                        >
                                            <h4 className="font-bold" style={{ color: currentTheme.colors.foreground }}>
                                                {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </h4>

                                            {/* Goals for this day */}
                                            {hasGoalsOnDay ? (
                                                <div className="space-y-2">
                                                    {currentMonthGoals.filter((g) => {
                                                        const dayStr = day.toISOString().split('T')[0];
                                                        return g.start_date <= dayStr && g.end_date >= dayStr;
                                                    }).map((goal) => (
                                                        <GoalBlock key={goal.id} goal={goal} onClick={() => onEditGoal?.(goal)} compact />
                                                    ))}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => onCreateGoal?.(day)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                                    style={{
                                                        backgroundColor: `${currentTheme.colors.primary}20`,
                                                        color: currentTheme.colors.primary,
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Create goal with this deadline</span>
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
