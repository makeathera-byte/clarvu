'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
    onSelect?: (themeId: string) => void;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function ThemeSelector({
    onSelect,
    showLabels = true,
    size = 'md'
}: ThemeSelectorProps) {
    const { currentTheme, setTheme, availableThemes } = useTheme();

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-28 h-28',
    };

    const handleSelect = (themeId: string) => {
        setTheme(themeId);
        onSelect?.(themeId);
    };

    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {availableThemes.map((theme) => (
                <motion.button
                    key={theme.id}
                    onClick={() => handleSelect(theme.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2"
                >
                    <div
                        className={`${sizeClasses[size]} rounded-2xl relative overflow-hidden border-2 transition-all duration-300`}
                        style={{
                            borderColor: currentTheme.id === theme.id
                                ? theme.colors.primary
                                : 'transparent',
                            boxShadow: currentTheme.id === theme.id
                                ? `0 0 20px ${theme.colors.primary}40`
                                : 'none',
                        }}
                    >
                        {/* Theme preview */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary}40 100%)`,
                            }}
                        />

                        {/* Accent dot */}
                        <div
                            className="absolute bottom-2 right-2 w-3 h-3 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                        />

                        {/* Selected check */}
                        {currentTheme.id === theme.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/30"
                            >
                                <Check
                                    className="w-6 h-6"
                                    style={{ color: theme.colors.primary }}
                                />
                            </motion.div>
                        )}
                    </div>

                    {showLabels && (
                        <span
                            className="text-sm font-medium transition-colors"
                            style={{
                                color: currentTheme.id === theme.id
                                    ? theme.colors.primary
                                    : 'inherit'
                            }}
                        >
                            {theme.name}
                        </span>
                    )}
                </motion.button>
            ))}
        </div>
    );
}
