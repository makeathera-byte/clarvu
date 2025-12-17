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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themePresets.map((theme) => (
                <motion.button
                    key={theme.id}
                    onClick={() => onSelect(theme.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${selectedTheme === theme.id
                        ? 'border-green-600 bg-green-50 shadow-lg shadow-green-100'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                        }`}
                >
                    {/* Selected Indicator */}
                    {selectedTheme === theme.id && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                            <FiCheck className="w-4 h-4 text-white" />
                        </motion.div>
                    )}

                    {/* Theme Preview */}
                    <div
                        className="w-full h-24 rounded-lg mb-3 shadow-md"
                        style={{
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                    />

                    {/* Theme Info */}
                    <h3 className="font-bold text-gray-900 mb-1">{theme.name}</h3>
                    <p className="text-xs text-gray-600">{theme.description}</p>
                </motion.button>
            ))}
        </div>
    );
}
