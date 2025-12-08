'use client';

// Prevent static generation - this page uses client-side theme context
export const dynamic = 'force-dynamic';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { TimerScreen } from '@/components/timer/TimerScreen';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TimerPage() {
    const { currentTheme } = useTheme();
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        // Complete entrance animation
        const timer = setTimeout(() => {
            setIsEntering(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with blur effect for timer focus */}
            <motion.div
                initial={{ filter: 'blur(0px)' }}
                animate={{ filter: isEntering ? 'blur(0px)' : 'blur(4px)' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute inset-0"
            >
                <BackgroundRenderer />
            </motion.div>

            {/* Darkening overlay for focus */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-black pointer-events-none"
            />

            {/* Focus sound panel */}
            <FocusSoundPanel />

            {/* Back button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="fixed top-6 left-6 z-30"
            >
                <Link href="/dashboard">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.foreground,
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Exit</span>
                    </motion.button>
                </Link>
            </motion.div>

            {/* Main content with fade animation */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 min-h-screen flex items-center justify-center px-4"
                >
                    <TimerScreen />
                </motion.div>
            </AnimatePresence>

            {/* Ambient particles (decorative) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                            opacity: 0,
                        }}
                        animate={{
                            y: [null, Math.random() * -100 - 50],
                            opacity: [0, 0.4, 0],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            filter: 'blur(1px)',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
