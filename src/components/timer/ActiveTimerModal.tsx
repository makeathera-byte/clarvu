'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore, formatTime } from '@/lib/timer/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { endTaskAction } from '@/app/dashboard/actions';
import { showBrowserNotification } from '@/lib/notifications/push';
import { X, Clock, Maximize2, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';

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
        pauseTimer,
        resumeTimer,
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

    // Handle ending the task (cancel without completing)
    const handleEndTask = useCallback(async () => {
        if (!taskId || isEnding) return;
        setIsEnding(true);
        closeTimer();
        setIsEnding(false);
    }, [taskId, closeTimer, isEnding]);

    // Handle completing the task with focus time
    const handleCompleteTask = useCallback(async () => {
        if (!taskId || isEnding) return;

        setIsEnding(true);
        try {
            // Calculate actual focused time
            const state = useTimerStore.getState();
            let actualFocusMinutes = 0;

            if (state.startedAt && state.endsAt) {
                const initialDuration = Math.round(
                    (state.endsAt.getTime() - state.startedAt.getTime()) / 1000
                );
                const actualFocusSeconds = initialDuration - remainingSeconds;
                actualFocusMinutes = Math.round(actualFocusSeconds / 60);
            }

            const result = await endTaskAction(taskId, actualFocusMinutes);
            if (result.success) {
                // Update local task store
                const taskStore = useTaskStore.getState();
                const existingTask = taskStore.tasks.find(t => t.id === taskId);
                if (existingTask) {
                    taskStore.addOrUpdate({
                        ...existingTask,
                        status: 'completed',
                        end_time: new Date().toISOString(),
                        duration_minutes: actualFocusMinutes,
                    } as any);
                }

                showBrowserNotification('Task Completed! ✅', {
                    body: `Great work! Logged ${actualFocusMinutes} minutes of focus time.`,
                    tag: 'task-complete',
                });

                closeTimer();
            }
        } finally {
            setIsEnding(false);
        }
    }, [taskId, closeTimer, isEnding, remainingSeconds]);

    // Format current time
    const formatCurrentTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    // Calculate progress percentage using actual timer duration
    const totalSeconds = (() => {
        const state = useTimerStore.getState();
        if (state.startedAt && state.endsAt) {
            return Math.round((state.endsAt.getTime() - state.startedAt.getTime()) / 1000);
        }
        return 30 * 60;
    })();
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
                            <div className="flex flex-col items-center gap-4">
                                {/* Primary row: Play/Pause + Reset */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => isRunning ? pauseTimer() : resumeTimer()}
                                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-lg"
                                        style={{
                                            backgroundColor: currentTheme.colors.primary,
                                            color: '#fff',
                                            boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                                        }}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                {remainingSeconds < totalSeconds ? 'Resume' : 'Start'}
                                            </>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={closeTimer}
                                        className="p-4 rounded-2xl"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                        title="Reset timer"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </motion.button>
                                </div>

                                {/* Complete Task button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCompleteTask}
                                    disabled={isEnding}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium w-full justify-center"
                                    style={{
                                        backgroundColor: '#22c55e',
                                        color: '#fff',
                                        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                    }}
                                >
                                    {isEnding ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Complete Task
                                </motion.button>

                                {/* Secondary row: Focus Mode + Minimize */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            closeTimer();
                                            router.push('/dashboard/timer');
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                        }}
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                        Focus Mode
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleEndTask}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                        }}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Minimize
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
}
