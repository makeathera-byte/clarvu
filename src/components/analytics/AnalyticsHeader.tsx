'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { BarChart3, Calendar } from 'lucide-react';

export function AnalyticsHeader() {
    const { currentTheme } = useTheme();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
        >
            {/* Left: Title */}
            <div>
                <h1
                    className="text-3xl font-bold mb-1 flex items-center gap-3"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <BarChart3
                        className="w-8 h-8"
                        style={{ color: currentTheme.colors.primary }}
                    />
                    Analytics Dashboard
                </h1>
                <p style={{ color: currentTheme.colors.mutedForeground }}>
                    Admin Overview of Productivity Metrics
                </p>
            </div>

            {/* Right: Date filter placeholder */}
            <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm cursor-pointer"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.mutedForeground,
                }}
            >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last 30 days</span>
            </div>
        </motion.header>
    );
}
