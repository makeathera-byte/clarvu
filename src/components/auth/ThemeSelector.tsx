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
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                >
                    {/* Selected Indicator */}
                    {selectedTheme === theme.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <FiCheck className="w-4 h-4 text-white" />
                        </div>
                    )}

                    {/* Theme Preview */}
                    <div
                        className="w-full h-24 rounded-lg mb-3"
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
