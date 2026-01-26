'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatDuration } from '@/lib/utils/date';
import { Clock } from 'lucide-react';

interface Task {
    id: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    duration_minutes: number | null;
}

interface TotalTimeCardProps {
    tasks: Task[];
}

export function TotalTimeCard({ tasks }: TotalTimeCardProps) {
    const { currentTheme } = useTheme();

    // Calculate total time from all completed tasks
    const totalMinutes = tasks
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => acc + (t.duration_minutes || 0), 0);

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
                <Clock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                Total Time Today
            </h3>

            {/* Total Time Display */}
            <div className="text-center py-4">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="mb-4"
                >
                    <div
                        className="text-5xl font-bold mb-2"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {formatDuration(totalMinutes)}
                    </div>
                </motion.div>

                <p
                    className="text-sm"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    Across all completed tasks
                </p>

                {/* Additional Stats */}
                <div
                    className="mt-4 pt-4 border-t grid grid-cols-2 gap-4"
                    style={{ borderColor: currentTheme.colors.border }}
                >
                    <div>
                        <p
                            className="text-xs mb-1"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Tasks
                        </p>
                        <p
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {tasks.filter(t => t.status === 'completed').length}
                        </p>
                    </div>
                    <div>
                        <p
                            className="text-xs mb-1"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Avg/Task
                        </p>
                        <p
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {tasks.filter(t => t.status === 'completed').length > 0
                                ? formatDuration(Math.round(totalMinutes / tasks.filter(t => t.status === 'completed').length))
                                : '0m'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
