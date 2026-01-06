'use client';

import { useCalendarViewStore, CalendarView } from '@/lib/store/useCalendarViewStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion } from 'framer-motion';

/**
 * Calendar View Toggle - Fixed at navbar level
 * Positioned parallel to navbar (top-0) on the right side
 */
export function CalendarViewToggleNavbar() {
    const { view, setView } = useCalendarViewStore();
    const { currentTheme } = useTheme();

    return (
        <div className="fixed top-4 left-4 z-50">
            <div
                className="flex items-center gap-1.5 rounded-xl p-1.5 shadow-lg border backdrop-blur-xl"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                {(['day', 'week', 'month', 'year'] as CalendarView[]).map((v) => (
                    <motion.button
                        key={v}
                        onClick={() => setView(v)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={{
                            backgroundColor: view === v ? currentTheme.colors.primary : 'transparent',
                            color: view === v ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground,
                        }}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
