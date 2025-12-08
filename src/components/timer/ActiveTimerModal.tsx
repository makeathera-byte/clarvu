'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore, formatTime } from '@/lib/timer/useTimerStore';
import { endTaskAction } from '@/app/dashboard/actions';
import { X, Square, Clock, Maximize2 } from 'lucide-react';

export function ActiveTimerModal() {
    const router = useRouter();
    const { currentTheme } = useTheme();
    const {
        isOpen,
        isRunning,
        taskId,
        taskTitle,
        remainingSeconds,
        decrementTimer,
        closeTimer,
    } = useTimerStore();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isEnding, setIsEnding] = useState(false);

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Timer countdown logic
    useEffect(() => {
        if (!isOpen || !isRunning) return;

        const interval = setInterval(() => {
            decrementTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, isRunning, decrementTimer]);

    // Auto-end when timer reaches 0
    useEffect(() => {
        if (remainingSeconds <= 0 && taskId && isRunning) {
            handleEndTask();
        }
    }, [remainingSeconds, taskId, isRunning]);

    // Handle ending the task
    const handleEndTask = useCallback(async () => {
        if (!taskId || isEnding) return;

        setIsEnding(true);
        try {
            const result = await endTaskAction(taskId);
            if (result.success) {
                closeTimer();
            }
        } finally {
            setIsEnding(false);
        }
    }, [taskId, closeTimer, isEnding]);

    // Format current time
    const formatCurrentTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    // Calculate progress percentage
    const totalSeconds = 30 * 60;
    const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center"
            >
                {/* Blurred wallpaper backdrop */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `var(--theme-wallpaper)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                        transform: 'scale(1.1)',
                    }}
                />

                {/* Dim overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: currentTheme.isDark
                            ? 'rgba(0, 0, 0, 0.7)'
                            : 'rgba(0, 0, 0, 0.5)',
                    }}
                />

                {/* Timer Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative z-10 w-full max-w-md mx-4"
                >
                    {/* Glassmorphism card */}
                    <div
                        className="rounded-3xl border backdrop-blur-xl overflow-hidden"
                        style={{
                            backgroundColor: currentTheme.isDark
                                ? 'rgba(0, 0, 0, 0.4)'
                                : 'rgba(255, 255, 255, 0.15)',
                            borderColor: currentTheme.isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(255, 255, 255, 0.3)',
                            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
                        }}
                    >
                        {/* Progress bar */}
                        <div
                            className="h-1 w-full"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    boxShadow: `0 0 20px ${currentTheme.colors.primary}`,
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            {/* Current clock */}
                            <div
                                className="flex items-center justify-center gap-2 mb-6"
                                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium tracking-wider">
                                    {formatCurrentTime()}
                                </span>
                            </div>

                            {/* Timer ring */}
                            <div className="relative w-64 h-64 mx-auto mb-6">
                                {/* Background ring */}
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(255, 255, 255, 0.1)"
                                        strokeWidth="3"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={currentTheme.colors.primary}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 45}
                                        strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                                        style={{
                                            filter: `drop-shadow(0 0 10px ${currentTheme.colors.primary})`,
                                        }}
                                    />
                                </svg>

                                {/* Timer text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        key={remainingSeconds}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        className="text-6xl font-bold tracking-tight"
                                        style={{ color: '#fff' }}
                                    >
                                        {formatTime(remainingSeconds)}
                                    </motion.span>
                                    <span
                                        className="text-sm mt-2"
                                        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    >
                                        remaining
                                    </span>
                                </div>
                            </div>

                            {/* Task title */}
                            <h2
                                className="text-xl font-semibold mb-8 truncate px-4"
                                style={{ color: '#fff' }}
                            >
                                {taskTitle || 'Focus Session'}
                            </h2>

                            {/* Action buttons */}
                            <div className="flex justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEndTask}
                                    disabled={isEnding}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium"
                                    style={{
                                        backgroundColor: currentTheme.colors.primary,
                                        color: '#fff',
                                        boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                                    }}
                                >
                                    {isEnding ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                    {isEnding ? 'Ending...' : 'End Now'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        closeTimer();
                                        router.push('/focus');
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Focus Mode
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={closeTimer}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                    Minimize
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
