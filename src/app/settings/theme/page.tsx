'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { Palette, Upload, RotateCcw, Check } from 'lucide-react';
import { updateThemeAction } from './actions';

export default function ThemeSettingsPage() {
    const { currentTheme, setTheme, clearCustomTheme, isCustomTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleThemeChange = async (themeId: string) => {
        // Update local state immediately
        setTheme(themeId);

        // Save to database
        startTransition(async () => {
            const result = await updateThemeAction(themeId);
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        });
    };

    return (
        <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                        >
                            <Palette
                                className="w-5 h-5"
                                style={{ color: currentTheme.colors.primary }}
                            />
                        </div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            Theme Settings
                        </h1>
                        {(isPending || saveSuccess) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                                style={{
                                    backgroundColor: saveSuccess
                                        ? `${currentTheme.colors.primary}20`
                                        : currentTheme.colors.muted,
                                    color: saveSuccess
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.mutedForeground,
                                }}
                            >
                                {saveSuccess ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        Saved
                                    </>
                                ) : (
                                    'Saving...'
                                )}
                            </motion.div>
                        )}
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Customize the look and feel of Clarvu
                    </p>
                </motion.div>

                {/* Theme Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="p-6 rounded-2xl backdrop-blur-xl border mb-6"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Theme Packs
                    </h2>
                    <p
                        className="text-sm mb-6"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Choose from our curated collection of themes
                    </p>

                    <ThemeSelector onSelect={handleThemeChange} size="md" />
                </motion.div>

                {/* Current Theme Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="p-6 rounded-2xl backdrop-blur-xl border mb-6"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Current Theme
                    </h2>

                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
                            }}
                        />
                        <div>
                            <p
                                className="font-semibold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                {currentTheme.name}
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                {currentTheme.description}
                            </p>
                        </div>
                    </div>

                    {/* Color swatches */}
                    <div className="flex gap-2">
                        {[
                            { label: 'Primary', color: currentTheme.colors.primary },
                            { label: 'Accent', color: currentTheme.colors.accent },
                            { label: 'Background', color: currentTheme.colors.background },
                        ].map((swatch) => (
                            <div key={swatch.label} className="text-center">
                                <div
                                    className="w-10 h-10 rounded-lg mb-1 border"
                                    style={{
                                        backgroundColor: swatch.color,
                                        borderColor: currentTheme.colors.border,
                                    }}
                                />
                                <span
                                    className="text-xs"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {swatch.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Custom Theme (Placeholder) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="p-6 rounded-2xl backdrop-blur-xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Custom Theme
                    </h2>
                    <p
                        className="text-sm mb-6"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Create your own personalized theme (coming soon)
                    </p>

                    <div className="space-y-4 opacity-50 pointer-events-none">
                        {/* Custom wallpaper upload */}
                        <div
                            className="p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3"
                            style={{ borderColor: currentTheme.colors.border }}
                        >
                            <Upload
                                className="w-5 h-5"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            />
                            <span style={{ color: currentTheme.colors.mutedForeground }}>
                                Upload custom wallpaper
                            </span>
                        </div>

                        {/* Color pickers placeholder */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="text-sm mb-2 block"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    Primary Color
                                </label>
                                <div
                                    className="h-10 rounded-lg"
                                    style={{ backgroundColor: currentTheme.colors.muted }}
                                />
                            </div>
                            <div>
                                <label
                                    className="text-sm mb-2 block"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    Accent Color
                                </label>
                                <div
                                    className="h-10 rounded-lg"
                                    style={{ backgroundColor: currentTheme.colors.muted }}
                                />
                            </div>
                        </div>
                    </div>

                    {isCustomTheme && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={clearCustomTheme}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl"
                            style={{
                                backgroundColor: currentTheme.colors.muted,
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to preset
                        </motion.button>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
