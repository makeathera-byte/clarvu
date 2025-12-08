'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { currentTheme, setTheme } = useTheme();
    const isDark = currentTheme.isDark;

    const toggleTheme = () => {
        // Toggle between minimal (light) and neon (dark)
        setTheme(isDark ? 'minimal' : 'neon');
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-colors"
            style={{
                backgroundColor: currentTheme.colors.muted,
                color: currentTheme.colors.foreground,
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </motion.button>
    );
}
