'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useSoundEngine, SOUND_LIBRARY } from '@/lib/sounds';
import {
    CloudRain,
    Flame,
    Bird,
    TreePine,
    Coffee,
    Wind,
    Waves,
    Volume2,
    Music,
    ChevronLeft,
    ChevronRight,
    LucideIcon,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    CloudRain,
    Flame,
    Bird,
    TreePine,
    Coffee,
    Wind,
    Waves,
};

export function FocusSoundPanel() {
    const { currentTheme } = useTheme();
    const { volumes, playing, toggleSound, setVolume } = useSoundEngine();
    const [isExpanded, setIsExpanded] = useState(false);

    const activeSoundsCount = Object.values(playing).filter(Boolean).length;

    return (
        <>
            {/* Toggle button (always visible) */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-2xl backdrop-blur-xl flex items-center gap-2"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
            >
                <Music className="w-5 h-5 text-white" />
                {activeSoundsCount > 0 && (
                    <span
                        className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            color: '#fff',
                        }}
                    >
                        {activeSoundsCount}
                    </span>
                )}
                {isExpanded ? (
                    <ChevronRight className="w-4 h-4 text-white/60" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-white/60" />
                )}
            </motion.button>

            {/* Sound panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-20 top-1/2 -translate-y-1/2 z-40 p-6 rounded-3xl backdrop-blur-xl w-72"
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-6">
                            <Volume2 className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">Focus Sounds</h3>
                        </div>

                        {/* Sound list */}
                        <div className="space-y-4">
                            {SOUND_LIBRARY.map((sound) => {
                                const Icon = iconMap[sound.icon] || Music;
                                const isPlaying = playing[sound.key] || false;
                                const volume = volumes[sound.key] ?? 0.5;

                                return (
                                    <motion.div
                                        key={sound.key}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        {/* Sound row */}
                                        <div className="flex items-center gap-3">
                                            {/* Toggle button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleSound(sound.key)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                                                style={{
                                                    backgroundColor: isPlaying
                                                        ? currentTheme.colors.primary
                                                        : 'rgba(255, 255, 255, 0.1)',
                                                    border: isPlaying
                                                        ? 'none'
                                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                                }}
                                            >
                                                <Icon
                                                    className="w-5 h-5"
                                                    style={{ color: isPlaying ? '#fff' : 'rgba(255, 255, 255, 0.6)' }}
                                                />
                                            </motion.button>

                                            {/* Label */}
                                            <span
                                                className="flex-1 text-sm font-medium"
                                                style={{ color: isPlaying ? '#fff' : 'rgba(255, 255, 255, 0.6)' }}
                                            >
                                                {sound.name}
                                            </span>
                                        </div>

                                        {/* Volume slider (only show when playing) */}
                                        <AnimatePresence>
                                            {isPlaying && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-13"
                                                >
                                                    <div className="flex items-center gap-3 pl-1">
                                                        <Volume2 className="w-3 h-3 text-white/40" />
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.1"
                                                            value={volume}
                                                            onChange={(e) => setVolume(sound.key, parseFloat(e.target.value))}
                                                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                                                            style={{
                                                                background: `linear-gradient(to right, ${currentTheme.colors.primary} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                                                            }}
                                                        />
                                                        <span className="text-xs text-white/40 w-8 text-right">
                                                            {Math.round(volume * 100)}%
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Tip */}
                        <p className="text-xs text-white/40 mt-6 text-center">
                            Mix multiple sounds for your perfect focus atmosphere
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
