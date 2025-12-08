'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore, formatTime } from '@/lib/timer/useTimerStore';
import { useSoundEngine } from '@/lib/sounds';
import { endTaskAction } from '@/app/dashboard/actions';
import { Clock, Square, Home } from 'lucide-react';

export function FocusTimer() {
    const router = useRouter();
    const { currentTheme } = useTheme();
    const {
        taskId,
        taskTitle,
        remainingSeconds,
        isRunning,
        decrementTimer,
        closeTimer,
    } = useTimerStore();
    const { stopAllSounds } = useSoundEngine();

    const [currentTime, setCurrentTime] = useState<string>('');
    const [isEnding, setIsEnding] = useState(false);

    // Update current time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!isRunning || remainingSeconds <= 0) return;

        const interval = setInterval(() => {
            decrementTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, remainingSeconds, decrementTimer]);

    // Auto-end when timer reaches 0
    useEffect(() => {
        if (remainingSeconds <= 0 && taskId && !isEnding) {
            handleEndSession();
        }
    }, [remainingSeconds, taskId, isEnding]);

    const handleEndSession = async () => {
        if (!taskId || isEnding) return;

        setIsEnding(true);
        stopAllSounds();

        try {
            await endTaskAction(taskId);
        } catch (error) {
            console.error('Failed to end task:', error);
        }

        closeTimer();
        router.push('/dashboard');
    };

    const handleGoHome = () => {
        router.push('/dashboard');
    };

    // No active timer
    if (!taskId) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12 rounded-3xl backdrop-blur-xl"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Clock className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <h2 className="text-xl font-semibold text-white mb-2">
                    No Active Timer
                </h2>
                <p className="text-white/60 mb-6">
                    Start a task from the Dashboard to begin focus mode.
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoHome}
                    className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
                >
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                </motion.button>
            </motion.div>
        );
    }

    // Calculate progress for visual indicator
    const maxSeconds = 30 * 60; // 30 minutes
    const progress = Math.max(0, Math.min(1, remainingSeconds / maxSeconds));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
                duration: 0.6,
            }}
            className="relative p-10 lg:p-14 rounded-3xl backdrop-blur-xl"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
        >
            {/* Subtle glow effect */}
            <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-3xl -z-10"
                style={{
                    background: `radial-gradient(circle at center, ${currentTheme.colors.primary}40, transparent 70%)`,
                }}
            />

            {/* Current time */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
            >
                <p className="text-white/50 text-sm mb-1">Current Time</p>
                <p className="text-2xl font-light text-white">{currentTime}</p>
            </motion.div>

            {/* Big countdown timer */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
            >
                <div
                    className="text-7xl lg:text-8xl font-bold tracking-tight mb-2"
                    style={{
                        color: '#fff',
                        textShadow: `0 0 60px ${currentTheme.colors.primary}60`,
                    }}
                >
                    {formatTime(remainingSeconds)}
                </div>

                {/* Progress bar */}
                <div
                    className="w-full h-1 rounded-full overflow-hidden mt-4"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            backgroundColor: currentTheme.colors.primary,
                            width: `${progress * 100}%`,
                        }}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </motion.div>

            {/* Task title */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-10"
            >
                <p className="text-white/50 text-sm mb-1">Working on</p>
                <p className="text-xl font-medium text-white">
                    {taskTitle || 'Untitled Task'}
                </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndSession}
                    disabled={isEnding}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium transition-all"
                    style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                >
                    <Square className="w-4 h-4" />
                    {isEnding ? 'Ending...' : 'End Session'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoHome}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Home className="w-4 h-4" />
                    Minimize
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
