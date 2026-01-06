'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { Goal } from '@/lib/store/useGoalsStore';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface MonthlyContextProps {
    currentMonthGoals: Goal[];
    lastMonthCompletedCount?: number;
}

/**
 * MonthlyContext - Read-only insights panel for monthly planning
 */
export function MonthlyContext({
    currentMonthGoals,
    lastMonthCompletedCount
}: MonthlyContextProps) {
    const { currentTheme } = useTheme();

    const activeGoalsCount = currentMonthGoals.filter(g => g.status === 'active').length;
    const completedGoalsCount = currentMonthGoals.filter(g => g.status === 'completed').length;

    return (
        <div className="space-y-3">
            {/* Active Goals Count */}
            <div
                className="p-3 rounded-lg border"
                style={{
                    backgroundColor: `${currentTheme.colors.accent}10`,
                    borderColor: `${currentTheme.colors.accent}40`,
                }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                    <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        This Month
                    </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                    {activeGoalsCount}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                    {activeGoalsCount === 1 ? 'Active goal' : 'Active goals'}
                </p>
            </div>

            {/* Last Month Summary */}
            {lastMonthCompletedCount !== undefined && lastMonthCompletedCount > 0 && (
                <div
                    className="p-3 rounded-lg border"
                    style={{
                        backgroundColor: `${currentTheme.colors.muted}60`,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                        <span
                            className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Last Month
                        </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: currentTheme.colors.foreground }}>
                        {lastMonthCompletedCount} completed
                    </p>
                    <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                        Great momentum! 🎯
                    </p>
                </div>
            )}

            {/* Motivational Tip */}
            <div
                className="p-3 rounded-lg border"
                style={{
                    backgroundColor: `${currentTheme.colors.primary}08`,
                    borderColor: `${currentTheme.colors.primary}20`,
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                    <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Active Goals
                    </span>
                </div>
                {currentMonthGoals.filter(g => g.status === 'active').length > 0 ? (
                    <ul className="space-y-1">
                        {currentMonthGoals.filter(g => g.status === 'active').map((goal) => (
                            <li
                                key={goal.id}
                                className="text-sm flex items-start gap-2"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                <span className="text-xs mt-0.5" style={{ color: currentTheme.colors.accent }}>•</span>
                                <span className="line-clamp-2">{goal.goal_text}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        No active goals this month
                    </p>
                )}
            </div>

            {/* Completed This Month */}
            {completedGoalsCount > 0 && (
                <div className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                    ✓ {completedGoalsCount} {completedGoalsCount === 1 ? 'goal' : 'goals'} completed this month
                </div>
            )}
        </div>
    );
}
