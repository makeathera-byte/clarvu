'use client';

import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Target, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { IntentWeekView } from './IntentWeekView';
import { IntentMonthView } from './IntentMonthView';
import { IntentYearView } from './IntentYearView';

interface IntentCalendarProps {
    onEditGoal?: (goal: any) => void;
    onCreateGoal?: (date?: Date) => void;
}

/**
 * Intent Calendar - Goals Calendar
 * Shows high-level planning: goals only
 * No time tracking, no timers - pure planning intent
 */
export function IntentCalendar({
    onEditGoal,
    onCreateGoal
}: IntentCalendarProps) {
    const { view } = useCalendarViewStore();
    const { currentTheme } = useTheme();

    // Intent calendar supports Week, Month, and Year views
    const effectiveView = view === 'day' ? 'week' : view;

    return (
        <div>
            {/* Action Buttons - hide in year view */}
            {effectiveView !== 'year' && (
                <div className="mb-6 flex gap-3 justify-center">
                    <motion.button
                        onClick={() => onCreateGoal?.()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-md transition-all"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            color: currentTheme.colors.primaryForeground,
                        }}
                    >
                        <Target className="w-4 h-4" />
                        <span>Add Goal</span>
                        <span className="text-xs opacity-70">(Shift+G)</span>
                    </motion.button>
                </div>
            )}

            {/* Calendar Views */}
            {effectiveView === 'week' && (
                <IntentWeekView
                    onEditGoal={onEditGoal}
                />
            )}
            {effectiveView === 'month' && (
                <IntentMonthView
                    onEditGoal={onEditGoal}
                    onCreateGoal={onCreateGoal}
                />
            )}
            {effectiveView === 'year' && (
                <IntentYearView
                    onEditGoal={onEditGoal}
                    onCreateGoal={onCreateGoal}
                />
            )}
        </div>
    );
}
