'use client';

import { memo } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Goal } from '@/lib/store/useGoalsStore';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MonthlyGoalsListProps {
    goals: Goal[];
    onGoalClick: (goal: Goal) => void;
    onGoalHover: (goalId: string | null) => void;
    hoveredGoalId: string | null;
}

/**
 * MonthlyGoalsList - Left panel component showing goals active in current month
 * Supports hover highlighting and click-to-edit
 * Memoized for performance
 */
export const MonthlyGoalsList = memo(function MonthlyGoalsList({
    goals,
    onGoalClick,
    onGoalHover,
    hoveredGoalId
}: MonthlyGoalsListProps) {
    const { currentTheme } = useTheme();

    const getStatusInfo = (goal: Goal) => {
        if (goal.status === 'completed') {
            return {
                icon: CheckCircle2,
                color: '#22c55e',
                label: 'Completed'
            };
        }

        // Check if goal is at risk (past end date but still active)
        const endDate = new Date(goal.end_date);
        const now = new Date();
        if (goal.status === 'active' && endDate < now) {
            return {
                icon: AlertCircle,
                color: '#f59e0b',
                label: 'At Risk'
            };
        }

        return {
            icon: Target,
            color: currentTheme.colors.accent,
            label: 'Active'
        };
    };

    const getGoalTypeBadge = (period: string) => {
        const badges = {
            '7d': { label: '7-Day', color: '#3b82f6' },
            '30d': { label: 'Monthly', color: '#8b5cf6' },
            '365d': { label: 'Yearly', color: '#ec4899' }
        };
        return badges[period as keyof typeof badges] || badges['7d'];
    };

    if (goals.length === 0) {
        return (
            <div
                className="text-center py-8 rounded-lg"
                style={{
                    backgroundColor: `${currentTheme.colors.muted}40`,
                    color: currentTheme.colors.mutedForeground,
                }}
            >
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No goals this month</p>
                <p className="text-xs mt-1 opacity-70">Create a goal to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {goals.map((goal) => {
                const status = getStatusInfo(goal);
                const badge = getGoalTypeBadge(goal.period);
                const isHovered = hoveredGoalId === goal.id;
                const StatusIcon = status.icon;

                return (
                    <motion.button
                        key={goal.id}
                        onClick={() => onGoalClick(goal)}
                        onMouseEnter={() => onGoalHover(goal.id)}
                        onMouseLeave={() => onGoalHover(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-4 rounded-xl border-2 transition-all"
                        style={{
                            backgroundColor: isHovered
                                ? `${currentTheme.colors.primary}10`
                                : currentTheme.colors.card,
                            borderColor: isHovered
                                ? currentTheme.colors.primary
                                : currentTheme.colors.border,
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <StatusIcon
                                    className="w-4 h-4 flex-shrink-0"
                                    style={{ color: status.color }}
                                />
                                <span
                                    className="text-xs font-medium px-2 py-0.5 rounded"
                                    style={{
                                        backgroundColor: `${badge.color}20`,
                                        color: badge.color,
                                    }}
                                >
                                    {badge.label}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h4
                            className="font-semibold mb-1 line-clamp-2"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {goal.goal_text}
                        </h4>

                        {/* Dates */}
                        <p
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {new Date(goal.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })} - {new Date(goal.end_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>

                        {/* Progress if available */}
                        {goal.progress_percentage !== undefined && goal.progress_percentage > 0 && (
                            <div className="mt-2">
                                <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ backgroundColor: `${currentTheme.colors.muted}` }}
                                >
                                    <div
                                        className="h-full transition-all"
                                        style={{
                                            width: `${goal.progress_percentage}%`,
                                            backgroundColor: status.color,
                                        }}
                                    />
                                </div>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {goal.progress_percentage}% complete
                                </p>
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
});
