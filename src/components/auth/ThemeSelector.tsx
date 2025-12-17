'use client';

import { motion } from 'framer-motion';
import { themePresets, type ThemePreset } from '@/lib/theme/presets';
import { FiCheck } from 'react-icons/fi';

interface ThemeSelectorProps {
    selectedTheme: string;
    onSelect: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {themePresets.map((theme) => {
                const isSelected = selectedTheme === theme.id;

                return (
                    <motion.button
                        key={theme.id}
                        onClick={() => onSelect(theme.id)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative rounded-2xl border-2 transition-all overflow-hidden ${isSelected
                                ? 'border-green-600 shadow-xl shadow-green-100'
                                : 'border-gray-200 hover:border-green-300 hover:shadow-lg'
                            }`}
                    >
                        {/* Selected Indicator */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', duration: 0.5 }}
                                className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg z-10"
                            >
                                <FiCheck className="w-5 h-5 text-white" strokeWidth={3} />
                            </motion.div>
                        )}

                        {/* Theme Preview - Gradient Background */}
                        <div
                            className="relative w-full h-28 flex items-end p-3"
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                            }}
                        >
                            {/* Mini dashboard preview overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                            {/* Small preview elements */}
                            <div className="relative z-10 w-full flex gap-1">
                                <div
                                    className="h-2 rounded-full flex-1"
                                    style={{ backgroundColor: theme.colors.accent, opacity: 0.6 }}
                                />
                                <div
                                    className="h-2 rounded-full flex-1"
                                    style={{ backgroundColor: theme.colors.accent, opacity: 0.4 }}
                                />
                                <div
                                    className="h-2 rounded-full flex-1"
                                    style={{ backgroundColor: theme.colors.accent, opacity: 0.8 }}
                                />
                            </div>
                        </div>

                        {/* Theme Info */}
                        <div className={`p-4 transition-colors ${isSelected ? 'bg-green-50' : 'bg-white'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-gray-900 text-sm">{theme.name}</h3>
                                {theme.isDark && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-white">
                                        Dark
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{theme.description}</p>

                            {/* Color dots preview */}
                            <div className="flex gap-1.5">
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: theme.colors.primary }}
                                    title="Primary"
                                />
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: theme.colors.accent }}
                                    title="Accent"
                                />
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm border border-gray-300"
                                    style={{ backgroundColor: theme.colors.background }}
                                    title="Background"
                                />
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
