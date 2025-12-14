'use client';

import { motion } from 'framer-motion';
import { TimerScreen } from '@/components/timer/TimerScreen';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function DashboardTimerPage() {
    const { currentTheme } = useTheme();

    return (
        <div className="min-h-screen relative">
            {/* Back button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
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
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </motion.button>
                </Link>
            </motion.div>

            {/* Main timer screen */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
                <TimerScreen />
            </div>

            {/* Ambient particles (decorative) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1000,
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
