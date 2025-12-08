'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatDuration } from '@/lib/utils/date';
import { Target, AlertTriangle } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    duration_minutes: number | null;
    category_id: string | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
    type: string;
}

interface DeepWorkCardProps {
    tasks: Task[];
    categories: Category[];
}

export function DeepWorkCard({ tasks, categories }: DeepWorkCardProps) {
    const { currentTheme } = useTheme();

    // Create category type map
    const categoryTypeMap = new Map(categories.map(c => [c.id, c.type]));
    const categoryColorMap = new Map(categories.map(c => [c.type, c.color]));

    // Calculate minutes by category type
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const minutesByType: Record<string, number> = {
        growth: 0,
        delivery: 0,
        admin: 0,
        personal: 0,
        necessity: 0,
        waste: 0,
    };

    completedTasks.forEach(task => {
        const type = categoryTypeMap.get(task.category_id || '') || 'personal';
        const minutes = task.duration_minutes || 30;
        if (minutesByType[type] !== undefined) {
            minutesByType[type] += minutes;
        }
    });

    const totalMinutes = Object.values(minutesByType).reduce((a, b) => a + b, 0);
    const deepWorkMinutes = minutesByType.growth + minutesByType.delivery;
    const distractionMinutes = minutesByType.waste;

    // Category breakdown for bar
    const categoryBreakdown = [
        { type: 'growth', label: 'Growth', color: '#22c55e', minutes: minutesByType.growth },
        { type: 'delivery', label: 'Delivery', color: '#1e3a8a', minutes: minutesByType.delivery },
        { type: 'admin', label: 'Admin', color: '#6b7280', minutes: minutesByType.admin },
        { type: 'personal', label: 'Personal', color: '#d1d5db', minutes: minutesByType.personal },
        { type: 'necessity', label: 'Necessity', color: '#facc15', minutes: minutesByType.necessity },
        { type: 'waste', label: 'Distraction', color: '#ef4444', minutes: minutesByType.waste },
    ].filter(c => c.minutes > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: currentTheme.colors.foreground }}
            >
                <Target className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Deep Work vs Distraction
            </h3>

            {/* Progress bar */}
            {totalMinutes > 0 ? (
                <>
                    <div
                        className="h-6 rounded-full overflow-hidden flex mb-4"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        {categoryBreakdown.map((cat, index) => {
                            const percentage = (cat.minutes / totalMinutes) * 100;
                            return (
                                <motion.div
                                    key={cat.type}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                                    className="h-full"
                                    style={{ backgroundColor: cat.color }}
                                    title={`${cat.label}: ${cat.minutes}m (${Math.round(percentage)}%)`}
                                />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {categoryBreakdown.map((cat) => (
                            <div key={cat.type} className="flex items-center gap-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span
                                    className="text-xs"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {cat.label} ({cat.minutes}m)
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary text */}
                    <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        <p className="text-sm" style={{ color: currentTheme.colors.foreground }}>
                            You spent{' '}
                            <span className="font-semibold" style={{ color: '#22c55e' }}>
                                {formatDuration(deepWorkMinutes)}
                            </span>
                            {' '}in deep work
                            {distractionMinutes > 0 && (
                                <>
                                    {' '}and{' '}
                                    <span className="font-semibold" style={{ color: '#ef4444' }}>
                                        {formatDuration(distractionMinutes)}
                                    </span>
                                    {' '}in distraction
                                </>
                            )}
                            {' '}today.
                        </p>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <AlertTriangle
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No completed tasks today
                    </p>
                </div>
            )}
        </motion.div>
    );
}
