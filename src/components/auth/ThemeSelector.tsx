'use client';

import { motion } from 'framer-motion';
import { themePresets } from '@/lib/theme/presets';
import { Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';

interface ThemeSelectorProps {
    selectedTheme: string;
    onSelect: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="space-y-6">
            {/* Hint text */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 justify-center"
            >
                <Sparkles className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <p className="text-sm font-semibold" style={{ color: currentTheme.colors.mutedForeground }}>
                    Click any theme to preview it instantly
                </p>
            </motion.div>

            {/* Theme Grid - Larger Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {themePresets.map((theme, index) => {
                    const isSelected = selectedTheme === theme.id;

                    return (
                        <motion.button
                            key={theme.id}
                            onClick={() => onSelect(theme.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.03, y: -6 }}
                            whileTap={{ scale: 0.97 }}
                            className="relative rounded-3xl overflow-hidden border-3 transition-all duration-300 group"
                            style={{
                                borderWidth: '3px',
                                borderColor: isSelected ? currentTheme.colors.primary : currentTheme.colors.border,
                                boxShadow: isSelected
                                    ? `0 12px 40px ${currentTheme.colors.primary}50, 0 0 0 4px ${currentTheme.colors.primary}20`
                                    : '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            {/* Selected Indicator - Top Right */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                                    }}
                                >
                                    <Check className="w-7 h-7" style={{ color: currentTheme.colors.primaryForeground }} strokeWidth={3} />
                                </motion.div>
                            )}

                            {/* Theme Preview - Large Gradient */}
                            <div className="relative w-full h-40 overflow-hidden">
                                {/* Background gradient */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 60%, ${theme.colors.primary} 100%)`,
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.4 }}
                                />

                                {/* Overlay pattern */}
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                                        backgroundSize: '30px 30px',
                                    }}
                                />

                                {/* Mini preview bars */}
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-10">
                                    {[0.8, 0.5, 0.9, 0.6].map((opacity, i) => (
                                        <motion.div
                                            key={i}
                                            className="h-3 rounded-full flex-1"
                                            style={{
                                                backgroundColor: theme.colors.accent,
                                                opacity,
                                            }}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: index * 0.1 + i * 0.05 }}
                                        />
                                    ))}
                                </div>

                                {/* Dark mode badge */}
                                {theme.isDark && (
                                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                                        <span className="text-xs font-bold text-white">DARK</span>
                                    </div>
                                )}
                            </div>

                            {/* Theme Info - Enhanced */}
                            <div
                                className="p-5 transition-all duration-300"
                                style={{
                                    backgroundColor: isSelected
                                        ? `${currentTheme.colors.primary}10`
                                        : currentTheme.colors.card,
                                }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3
                                        className="font-extrabold text-xl"
                                        style={{
                                            color: isSelected ? currentTheme.colors.primary : currentTheme.colors.foreground,
                                        }}
                                    >
                                        {theme.name}
                                    </h3>
                                </div>
                                <p
                                    className="text-sm mb-4 leading-relaxed"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {theme.description}
                                </p>

                                {/* Color Palette Preview */}
                                <div className="flex gap-2">
                                    <div
                                        className="w-8 h-8 rounded-lg shadow-md border"
                                        style={{
                                            backgroundColor: theme.colors.primary,
                                            borderColor: currentTheme.colors.border,
                                        }}
                                        title="Primary"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-lg shadow-md border"
                                        style={{
                                            backgroundColor: theme.colors.accent,
                                            borderColor: currentTheme.colors.border,
                                        }}
                                        title="Accent"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-lg shadow-md border-2"
                                        style={{
                                            backgroundColor: theme.colors.background,
                                            borderColor: currentTheme.colors.border,
                                        }}
                                        title="Background"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-lg shadow-md border"
                                        style={{
                                            backgroundColor: theme.colors.card,
                                            borderColor: currentTheme.colors.border,
                                        }}
                                        title="Card"
                                    />
                                </div>
                            </div>

                            {/* Hover glow effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary}15, transparent 70%)`,
                                }}
                            />
                        </motion.button>
                    );
                })}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${currentTheme.colors.muted};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${currentTheme.colors.primary};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${currentTheme.colors.accent};
                }
            `}</style>
        </div>
    );
}
