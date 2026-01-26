'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Flame, Clock } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    start_time: string | null;
    duration_minutes: number | null;
    created_at: string;
}

interface MostProductiveHourProps {
    tasks: Task[];
}

export function MostProductiveHour({ tasks }: MostProductiveHourProps) {
    const { currentTheme } = useTheme();

    // Calculate productivity by hour
    const hourBuckets: Record<number, number> = {};

    tasks
        .filter(t => t.status === 'completed')
        .forEach(task => {
            const dateToUse = task.start_time || task.created_at;
            const hour = new Date(dateToUse).getHours();
            const duration = task.duration_minutes || 30;
            hourBuckets[hour] = (hourBuckets[hour] || 0) + duration;
        });

    // Find most productive hour
    let mostProductiveHour = -1;
    let maxMinutes = 0;

    Object.entries(hourBuckets).forEach(([hour, minutes]) => {
        if (minutes > maxMinutes) {
            maxMinutes = minutes;
            mostProductiveHour = parseInt(hour);
        }
    });

    // Format hour range
    const formatHour = (hour: number): string => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    };

    const hourRange = mostProductiveHour >= 0
        ? `${formatHour(mostProductiveHour)} – ${formatHour((mostProductiveHour + 1) % 24)}`
        : 'No data yet';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
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
                <Clock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Most Productive Hour
            </h3>

            {mostProductiveHour >= 0 ? (
                <div className="text-center py-4">
                    {/* Flame icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                        }}
                    >
                        <Flame className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Time range */}
                    <p
                        className="text-2xl font-bold mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {hourRange}
                    </p>

                    {/* Description */}
                    <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        You complete the most work during this hour
                    </p>

                    {/* Stats */}
                    <div
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        <span
                            className="text-sm font-medium"
                            style={{ color: currentTheme.colors.primary }}
                        >
                            {maxMinutes} minutes
                        </span>
                        <span
                            className="text-sm"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            of deep work
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Clock
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Complete more tasks to see patterns
                    </p>
                </div>
            )}
        </motion.div>
    );
}
