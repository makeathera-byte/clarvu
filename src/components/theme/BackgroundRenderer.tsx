'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';

export function BackgroundRenderer() {
    const { currentTheme, isTransitioning } = useTheme();

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Wallpaper layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTheme.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${currentTheme.wallpaper})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </AnimatePresence>

            {/* Color overlay for themes without wallpapers */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: currentTheme.isDark ? 0.3 : 0.1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{
                    backgroundColor: currentTheme.colors.background,
                }}
            />

            {/* Vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 40%, ${currentTheme.colors.background} 100%)`,
                    opacity: 0.6,
                }}
            />

            {/* Subtle gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(180deg, transparent 0%, ${currentTheme.colors.background}40 100%)`,
                }}
            />

            {/* Transition overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
