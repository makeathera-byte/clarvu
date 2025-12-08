'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { themePresets, ThemePreset } from '@/lib/theme/presets';
import { Check } from 'lucide-react';

interface AuthThemeSelectorProps {
    selectedThemeId: string;
    onSelect: (themeId: string) => void;
    error?: string;
}

export function AuthThemeSelector({
    selectedThemeId,
    onSelect,
    error
}: AuthThemeSelectorProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="space-y-3">
            <label
                className="block text-sm font-medium"
                style={{ color: currentTheme.colors.foreground }}
            >
                Choose your theme <span style={{ color: currentTheme.colors.primary }}>*</span>
            </label>

            {/* Theme grid */}
            <div className="grid grid-cols-5 gap-3">
                {themePresets.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedThemeId === theme.id}
                        onSelect={() => onSelect(theme.id)}
                    />
                ))}
            </div>

            {/* Selected theme name */}
            {selectedThemeId && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    Selected: <span style={{ color: currentTheme.colors.primary, fontWeight: 500 }}>
                        {themePresets.find(t => t.id === selectedThemeId)?.name}
                    </span>
                </motion.p>
            )}

            {/* Error message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-center"
                    style={{ color: '#ef4444' }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}

interface ThemeCardProps {
    theme: ThemePreset;
    isSelected: boolean;
    onSelect: () => void;
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
    return (
        <motion.button
            type="button"
            onClick={onSelect}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200"
            style={{
                borderColor: isSelected ? theme.colors.primary : 'transparent',
                boxShadow: isSelected
                    ? `0 0 20px ${theme.colors.primary}40, 0 4px 12px ${theme.colors.primary}20`
                    : '0 4px 12px rgba(0,0,0,0.1)',
            }}
        >
            {/* Background gradient preview */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary}30 50%, ${theme.colors.accent}20 100%)`,
                }}
            />

            {/* Color palette dots */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                />
            </div>

            {/* Selected checkmark */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                >
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.primary }}
                    >
                        <Check className="w-4 h-4 text-white" />
                    </div>
                </motion.div>
            )}
        </motion.button>
    );
}
