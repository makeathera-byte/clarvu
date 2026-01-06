'use client';

import { Goal } from '@/lib/store/useGoalsStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion } from 'framer-motion';
import { Target, Calendar } from 'lucide-react';

interface GoalBlockProps {
    goal: Goal;
    onClick?: () => void;
    compact?: boolean;
}

/**
 * Goal Block Component
 * Visual representation of a goal - thicker, softer appearance
 * Clearly different from task blocks (execution calendar)
 */
export function GoalBlock({ goal, onClick, compact = false }: GoalBlockProps) {
    const { currentTheme } = useTheme();

    const getPriorityColor = () => {
        switch (goal.priority) {
            case 'high':
                return '#ef4444';
            case 'low':
                return '#6b7280';
            default:
                return currentTheme.colors.accent;
        }
    };

    const getPeriodLabel = () => {
        switch (goal.period) {
            case '7d':
                return '7 Days';
            case '30d':
                return '30 Days';
            case '365d':
                return 'Year';
            default:
                return goal.period;
        }
    };

    const formatDateRange = () => {
        const start = new Date(goal.start_date);
        const end = new Date(goal.end_date);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left rounded-xl transition-all duration-200 ${compact ? 'p-3' : 'p-4'}`}
            style={{
                backgroundColor: `${getPriorityColor()}15`,
                borderLeft: `5px solid ${getPriorityColor()}`,
                border: `2px solid ${getPriorityColor()}30`,
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 flex-shrink-0" style={{ color: getPriorityColor() }} />
                        <span
                            className={`font-bold ${compact ? 'text-sm' : 'text-base'}`}
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {goal.goal_text}
                        </span>
                    </div>

                    {!compact && goal.notes && (
                        <p
                            className="text-xs mt-2 line-clamp-2"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {goal.notes}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                        <div
                            className="flex items-center gap-1 text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateRange()}</span>
                        </div>

                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                                backgroundColor: `${getPriorityColor()}20`,
                                color: getPriorityColor(),
                            }}
                        >
                            {getPeriodLabel()}
                        </span>
                    </div>
                </div>

                {/* Progress indicator */}
                {goal.progress_percentage !== undefined && goal.progress_percentage > 0 && (
                    <div className="flex-shrink-0">
                        <div
                            className="text-2xl font-bold"
                            style={{ color: getPriorityColor() }}
                        >
                            {goal.progress_percentage}%
                        </div>
                    </div>
                )}
            </div>

            {/* Sub-goals progress */}
            {goal.sub_goals && goal.sub_goals.length > 0 && !compact && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: `${getPriorityColor()}20` }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                        <span>
                            {goal.sub_goals.filter(sg => sg.completed).length} / {goal.sub_goals.length} milestones
                        </span>
                    </div>
                </div>
            )}
        </motion.button>
    );
}
