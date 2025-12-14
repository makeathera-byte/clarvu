'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const PREVIOUS_DARK_THEME_KEY = 'clarvu-previous-dark-theme';

export function ThemeToggle() {
    const { currentTheme, setTheme } = useTheme();
    const isDark = currentTheme.isDark;

    const toggleTheme = () => {
        if (currentTheme.id === 'minimal') {
            // Switching from light to dark - restore previous dark theme
            const previousDarkTheme = localStorage.getItem(PREVIOUS_DARK_THEME_KEY) || 'neon';
            setTheme(previousDarkTheme);
        } else {
            // Switching from dark to light - save current dark theme for later
            localStorage.setItem(PREVIOUS_DARK_THEME_KEY, currentTheme.id);
            setTheme('minimal');
        }
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
