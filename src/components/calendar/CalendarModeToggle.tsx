'use client';

import { useCalendarModeStore } from '@/lib/store/useCalendarModeStore';
import { useTheme } from '@/lib/theme/ThemeContext';
import { motion } from 'framer-motion';
import { Timer, Target } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Pill-shaped toggle for switching between Execution and Intent calendars
 * 
 * Keyboard shortcuts:
 * - T: Switch to Execution
 * - G: Switch to Intent
 */
export function CalendarModeToggle() {
    const { mode, setMode } = useCalendarModeStore();
    const { currentTheme } = useTheme();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input field
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 't' || e.key === 'T') {
                setMode('execution');
            } else if (e.key === 'g' || e.key === 'G') {
                setMode('intent');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [setMode]);

    return (
        <div className="flex justify-center mb-4">
            <div
                className="inline-flex items-center rounded-full p-1.5 shadow-lg border"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <motion.button
                    onClick={() => setMode('execution')}
                    className="relative px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors"
                    style={{
                        color: mode === 'execution' ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {mode === 'execution' && (
                        <motion.div
                            layoutId="calendarModeIndicator"
                            className="absolute inset-0 rounded-full shadow-md"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <Timer className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Execution</span>
                    <span
                        className="relative z-10 text-xs opacity-60 ml-1"
                        style={{ color: mode === 'execution' ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground }}
                    >
                        (T)
                    </span>
                </motion.button>

                <motion.button
                    onClick={() => setMode('intent')}
                    className="relative px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-colors"
                    style={{
                        color: mode === 'intent' ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {mode === 'intent' && (
                        <motion.div
                            layoutId="calendarModeIndicator"
                            className="absolute inset-0 rounded-full shadow-md"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <Target className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Intent</span>
                    <span
                        className="relative z-10 text-xs opacity-60 ml-1"
                        style={{ color: mode === 'intent' ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground }}
                    >
                        (G)
                    </span>
                </motion.button>
            </div>
        </div>
    );
}
