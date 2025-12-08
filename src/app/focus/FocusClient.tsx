'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { useSoundEngine } from '@/lib/sounds';
import { FocusTimer, FocusSoundPanel } from '@/components/focus';

export function FocusClient() {
    const { currentTheme } = useTheme();
    const { isRunning } = useTimerStore();
    const { loadSounds } = useSoundEngine();

    // Preload sounds on mount
    useEffect(() => {
        loadSounds();
    }, [loadSounds]);

    // Dynamic blur based on timer state
    const blurAmount = isRunning ? 8 : 2;
    const overlayOpacity = isRunning ? 0.4 : 0.2;

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* Wallpaper Background */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: currentTheme.wallpaper
                        ? `url(${currentTheme.wallpaper})`
                        : `linear-gradient(135deg, ${currentTheme.colors.card} 0%, ${currentTheme.colors.background} 100%)`,
                }}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Dynamic Blur Overlay */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backdropFilter: `blur(${blurAmount}px)`,
                    WebkitBackdropFilter: `blur(${blurAmount}px)`,
                }}
                animate={{
                    backdropFilter: `blur(${blurAmount}px)`,
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Dark Overlay */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
                }}
                animate={{
                    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Subtle animated background pulse when running */}
            {isRunning && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        opacity: [0.02, 0.05, 0.02],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        background: `radial-gradient(circle at center, ${currentTheme.colors.primary}, transparent 70%)`,
                    }}
                />
            )}

            {/* Ambient particles (optional decorative) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white/5"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: '110%',
                        }}
                        animate={{
                            y: '-10%',
                        }}
                        transition={{
                            duration: Math.random() * 20 + 15,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>

            {/* Main Content - Centered Timer */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
                <FocusTimer />
            </div>

            {/* Sound Panel */}
            <FocusSoundPanel />
        </div>
    );
}
