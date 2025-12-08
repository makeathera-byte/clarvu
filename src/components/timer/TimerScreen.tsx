'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore, formatTime } from '@/lib/timer/useTimerStore';
import { Play, Pause, RotateCcw, Home } from 'lucide-react';

export function TimerScreen() {
    const router = useRouter();
    const { currentTheme } = useTheme();
    const {
        taskId,
        taskTitle,
        remainingSeconds,
        isOpen,
        isRunning,
        openTimer,
        closeTimer,
        pauseTimer,
        resumeTimer,
        decrementTimer,
        setRemainingSeconds,
    } = useTimerStore();

    const [localSeconds, setLocalSeconds] = useState(25 * 60); // 25 min default for standalone
    const [isLocalRunning, setIsLocalRunning] = useState(false);
    const [currentSession, setCurrentSession] = useState(1);

    // Use store timer if active, otherwise use local state
    const seconds = taskId ? remainingSeconds : localSeconds;
    const running = taskId ? isRunning : isLocalRunning;

    // Countdown timer
    useEffect(() => {
        if (!running || seconds <= 0) return;

        const interval = setInterval(() => {
            if (taskId) {
                decrementTimer();
            } else {
                setLocalSeconds((s) => Math.max(0, s - 1));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [running, seconds, taskId, decrementTimer]);

    const handleStartPause = () => {
        if (taskId) {
            if (isRunning) {
                pauseTimer();
            } else {
                resumeTimer();
            }
        } else {
            if (isLocalRunning) {
                setIsLocalRunning(false);
            } else {
                // Start a standalone focus session
                openTimer('standalone-focus', 'Focus Session', localSeconds);
            }
        }
    };

    const handleReset = () => {
        if (taskId) {
            setRemainingSeconds(25 * 60);
            pauseTimer();
        } else {
            setLocalSeconds(25 * 60);
            setIsLocalRunning(false);
        }
    };

    const handleGoHome = () => {
        router.push('/dashboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center justify-center min-h-[60vh]"
        >
            {/* Glassmorphism Timer Box */}
            <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="relative"
            >
                {/* Glow effect behind */}
                <div
                    className="absolute -inset-8 rounded-3xl opacity-50 blur-3xl"
                    style={{
                        background: `radial-gradient(circle, ${currentTheme.colors.primary}40 0%, transparent 70%)`,
                    }}
                />

                {/* Timer container */}
                <div
                    className="relative px-16 py-14 rounded-3xl backdrop-blur-xl border"
                    style={{
                        backgroundColor: `${currentTheme.colors.card}`,
                        borderColor: currentTheme.colors.border,
                        boxShadow: `
              0 0 60px ${currentTheme.colors.primary}15,
              0 25px 50px -12px ${currentTheme.colors.background}80,
              inset 0 1px 0 ${currentTheme.colors.accent}20
            `,
                    }}
                >
                    {/* Timer Display */}
                    <div className="text-center">
                        {/* Mode indicator */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm font-medium uppercase tracking-widest mb-4"
                            style={{ color: currentTheme.colors.primary }}
                        >
                            {taskTitle || 'Focus Time'}
                        </motion.p>

                        {/* Time display */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="font-light tracking-tight"
                            style={{
                                fontSize: 'clamp(4rem, 15vw, 8rem)',
                                color: currentTheme.colors.foreground,
                                textShadow: `0 0 40px ${currentTheme.colors.primary}30`,
                            }}
                        >
                            {formatTime(seconds)}
                        </motion.div>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-sm mt-4"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {running ? 'Stay focused!' : 'Press Start to begin'}
                        </motion.p>
                    </div>

                    {/* Control buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center justify-center gap-4 mt-10"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartPause}
                            className="px-8 py-3 rounded-2xl font-medium transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: currentTheme.colors.primaryForeground,
                                boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                            }}
                        >
                            {running ? (
                                <>
                                    <Pause className="w-5 h-5" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Start Focus
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className="px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: `${currentTheme.colors.muted}`,
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGoHome}
                            className="px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: `${currentTheme.colors.muted}`,
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </motion.button>
                    </motion.div>

                    {/* Session indicator dots */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-2 mt-8"
                    >
                        {[1, 2, 3, 4].map((dot) => (
                            <div
                                key={dot}
                                className="w-2 h-2 rounded-full transition-colors"
                                style={{
                                    backgroundColor: dot <= currentSession
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.muted,
                                }}
                            />
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

