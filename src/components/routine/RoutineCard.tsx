'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Clock } from 'lucide-react';

interface RoutineItem {
    time: string;
    activity: string;
    duration: string;
    category?: string;
}

interface RoutineCardProps {
    item: RoutineItem;
    index: number;
    delay: number;
}

// Category color mapping
const categoryColors: Record<string, string> = {
    growth: '#22c55e',
    delivery: '#1e3a8a',
    admin: '#6b7280',
    personal: '#a855f7',
    necessity: '#facc15',
    waste: '#ef4444',
};

export function RoutineCard({ item, index, delay }: RoutineCardProps) {
    const { currentTheme } = useTheme();

    const categoryColor = categoryColors[item.category || 'personal'] || currentTheme.colors.primary;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + index * 0.05, duration: 0.4 }}
            className="flex items-start gap-4 p-4 rounded-xl border group hover:scale-[1.01] transition-transform"
            style={{
                backgroundColor: currentTheme.colors.muted,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Time indicator */}
            <div className="flex flex-col items-center shrink-0">
                <div
                    className="w-3 h-3 rounded-full mb-1"
                    style={{ backgroundColor: categoryColor }}
                />
                <div
                    className="w-0.5 h-full min-h-[40px] rounded-full opacity-30"
                    style={{ backgroundColor: categoryColor }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Time */}
                <div
                    className="flex items-center gap-1.5 text-sm font-medium mb-1"
                    style={{ color: categoryColor }}
                >
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                </div>

                {/* Activity */}
                <p
                    className="font-medium"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    {item.activity}
                </p>

                {/* Duration & Category */}
                <div className="flex items-center gap-2 mt-1">
                    <span
                        className="text-xs"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        {item.duration}
                    </span>

                    {item.category && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                            }}
                        >
                            {item.category}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
