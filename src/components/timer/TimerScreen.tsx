'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore, formatTime } from '@/lib/timer/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { endTaskAction, logFocusSessionAction, updateTaskAction } from '@/app/dashboard/actions';
import { showBrowserNotification } from '@/lib/notifications/push';
import { Play, Pause, RotateCcw, Home, CheckCircle, Clock, Coffee, Zap, Timer, Settings, MoreVertical, Plus, ArrowUp } from 'lucide-react';

// Timer modes
type TimerMode = 'focus' | 'break' | 'pomodoro' | 'custom';

// Presets for standalone focus timer
const FOCUS_PRESETS = [
    { label: '25m', seconds: 25 * 60 },
    { label: '15m', seconds: 15 * 60 },
    { label: '10m', seconds: 10 * 60 },
    { label: '5m', seconds: 5 * 60 },
];

const BREAK_PRESETS = [
    { label: '5m', seconds: 5 * 60 },
    { label: '10m', seconds: 10 * 60 },
    { label: '15m', seconds: 15 * 60 },
];

// Pomodoro settings
const POMODORO_FOCUS = 25 * 60; // 25 min focus
const POMODORO_SHORT_BREAK = 5 * 60; // 5 min break
const POMODORO_LONG_BREAK = 15 * 60; // 15 min long break
const POMODORO_CYCLES = 4; // Long break after 4 focus sessions

export function TimerScreen() {
    const router = useRouter();
    const { currentTheme } = useTheme();
    const {
        // Task timer
        taskId,
        taskTitle,
        remainingSeconds: taskRemainingSeconds,
        isRunning: isTaskRunning,
        closeTimer,
        pauseTimer,
        resumeTimer,
        decrementTimer,
        // Task count-up state
        taskCountUpId,
        taskCountUpTitle,
        taskCountUpSeconds,
        taskCountUpIsRunning,
        pauseTaskCountUp,
        resumeTaskCountUp,
        stopTaskCountUp,
        // Focus timer state (shared with Dashboard)
        focusSeconds,
        focusTotalSeconds,
        focusMode,
        focusIsRunning,
        countUpMode,
        countUpSeconds,
        // Focus timer actions
        setFocusTimer,
        setFocusMode,
        startFocusTimer,
        pauseFocusTimer,
        resetFocusTimer,
        decrementFocusTimer,
        addFocusTime,
        toggleCountUpMode,
        incrementCountUp,
        resetCountUp,
        // Pomodoro settings
        pomodoroFocusMins,
        pomodoroBreakMins,
        autoStartBreak,
        setPomodoroSettings,
    } = useTimerStore();

    // Create aliases for cleaner code (using store values directly)
    const mode = focusMode;
    const localSeconds = focusSeconds;
    const localTotalSeconds = focusTotalSeconds;
    const isLocalRunning = focusIsRunning;

    // UI-only local state (not synced)
    const [isEnding, setIsEnding] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customMinutes, setCustomMinutes] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuCustomMinutes, setMenuCustomMinutes] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    // Pomodoro state (local - Pomodoro is specific to /timer page)
    const [pomodoroSession, setPomodoroSession] = useState(1);
    const [isBreak, setIsBreak] = useState(false);

    // DEBUG: Log store values on mount and when they change
    useEffect(() => {
        console.log('[TimerScreen] Store state:', {
            focusIsRunning,
            countUpMode,
            countUpSeconds,
            focusSeconds,
            focusTotalSeconds,
        });
    }, [focusIsRunning, countUpMode, countUpSeconds, focusSeconds, focusTotalSeconds]);

    // Determine which timer mode we're in
    const isTaskMode = !!taskId;
    const isTaskCountUpMode = !!taskCountUpId;
    const seconds = isTaskMode ? taskRemainingSeconds : (isTaskCountUpMode ? taskCountUpSeconds : (countUpMode ? countUpSeconds : localSeconds));
    const isRunning = isTaskMode ? isTaskRunning : (isTaskCountUpMode ? taskCountUpIsRunning : isLocalRunning);

    // Calculate total seconds for progress bar
    const totalSeconds = (() => {
        if (isTaskMode) {
            const state = useTimerStore.getState();
            if (state.startedAt && state.endsAt) {
                return Math.round((state.endsAt.getTime() - state.startedAt.getTime()) / 1000);
            }
            return 30 * 60;
        }
        return localTotalSeconds;
    })();

    // Countdown timer for task mode
    useEffect(() => {
        if (!isTaskMode || !isTaskRunning || taskRemainingSeconds <= 0) return;

        const interval = setInterval(() => {
            decrementTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTaskMode, isTaskRunning, taskRemainingSeconds, decrementTimer]);

    // Countdown timer for local mode - using store action
    useEffect(() => {
        if (isTaskMode || !isLocalRunning || localSeconds <= 0 || countUpMode) return;

        const interval = setInterval(() => {
            decrementFocusTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTaskMode, isLocalRunning, localSeconds, countUpMode, decrementFocusTimer]);

    // Auto-start break when focus timer reaches 0
    useEffect(() => {
        if (isTaskMode || countUpMode) return;
        if (!autoStartBreak) return;

        // Only trigger when focus timer just completed (at 0, was running, in focus mode)
        if (localSeconds === 0 && mode === 'focus') {
            // Switch to break mode and start the break timer
            setFocusMode('break');
            setFocusTimer(pomodoroBreakMins * 60, pomodoroBreakMins * 60);
            startFocusTimer();
        }
    }, [localSeconds, mode, isTaskMode, countUpMode, autoStartBreak, pomodoroBreakMins, setFocusMode, setFocusTimer, startFocusTimer]);

    // Click-outside handler for menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // Task count-up timer effect (for individual task timing)
    useEffect(() => {
        if (!isTaskCountUpMode || !taskCountUpIsRunning) return;

        const interval = setInterval(() => {
            const { incrementTaskCountUp } = useTimerStore.getState();
            incrementTaskCountUp();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTaskCountUpMode, taskCountUpIsRunning]);

    // Count-up timer effect (stopwatch mode) - using store action
    useEffect(() => {
        if (!countUpMode || !isLocalRunning || isTaskMode || isTaskCountUpMode) return;

        const interval = setInterval(() => {
            incrementCountUp();
        }, 1000);

        return () => clearInterval(interval);
    }, [countUpMode, isLocalRunning, isTaskMode, isTaskCountUpMode, incrementCountUp]);

    // Menu handler functions - using store actions
    const handleAddTime = (addSecs: number) => {
        if (isTaskMode || countUpMode) return;
        addFocusTime(addSecs);
        setMenuOpen(false);
    };

    const handleSetPreset = (presetSeconds: number) => {
        if (isLocalRunning || isTaskMode) return;
        setFocusTimer(presetSeconds, presetSeconds);
        setFocusMode('focus');
        if (countUpMode) toggleCountUpMode();
        setMenuOpen(false);
    };

    const handleToggleCountUp = () => {
        if (isTaskMode) return;
        pauseFocusTimer();
        toggleCountUpMode();
        if (!countUpMode) {
            resetCountUp();
        } else {
            setFocusTimer(25 * 60, 25 * 60);
        }
        setMenuOpen(false);
    };

    const handleResetTimerMenu = () => {
        if (isTaskMode) return;
        pauseFocusTimer();
        if (countUpMode) {
            resetCountUp();
        } else {
            resetFocusTimer();
        }
        setMenuOpen(false);
    };

    const handleMenuCustomTime = () => {
        const mins = parseInt(menuCustomMinutes);
        if (!isNaN(mins) && mins > 0 && mins <= 180) {
            const secs = mins * 60;
            setFocusTimer(secs, secs);
            setFocusMode('focus');
            if (countUpMode) toggleCountUpMode();
            setMenuCustomMinutes('');
            setMenuOpen(false);
        }
    };

    // Auto-complete when timer reaches 0
    useEffect(() => {
        if (isTaskMode && taskRemainingSeconds <= 0 && taskId && !isEnding) {
            handleCompleteTask();
        } else if (!isTaskMode && localSeconds <= 0 && isLocalRunning) {
            pauseFocusTimer();

            if (mode === 'pomodoro') {
                handlePomodoroComplete();
            } else {
                // Log focus session to deep work (not breaks)
                if (mode === 'focus') {
                    const focusMinutes = Math.round(localTotalSeconds / 60);
                    logFocusSessionAction(focusMinutes, 'focus');
                }

                showBrowserNotification(
                    isBreak ? 'Break Complete! ☕' : 'Focus Session Complete! 🎉',
                    {
                        body: `${isBreak ? 'Break' : 'Focus'} session of ${Math.round(localTotalSeconds / 60)} minutes completed.`,
                        tag: 'timer-complete',
                    }
                );
            }
        }
    }, [taskRemainingSeconds, taskId, isEnding, localSeconds, isLocalRunning, isTaskMode, localTotalSeconds, mode, isBreak, pauseFocusTimer]);

    // Handle Pomodoro cycle completion
    const handlePomodoroComplete = () => {
        if (isBreak) {
            // Break complete, start new focus
            setIsBreak(false);
            setFocusTimer(POMODORO_FOCUS, POMODORO_FOCUS);
            showBrowserNotification('Break Over! 🚀', {
                body: 'Time to focus again!',
                tag: 'pomodoro',
            });
        } else {
            // Focus complete - log to deep work
            const focusMinutes = Math.round(POMODORO_FOCUS / 60);
            logFocusSessionAction(focusMinutes, 'pomodoro');

            const newSession = pomodoroSession + 1;

            if (pomodoroSession % POMODORO_CYCLES === 0) {
                // Long break
                setIsBreak(true);
                setFocusTimer(POMODORO_LONG_BREAK, POMODORO_LONG_BREAK);
                showBrowserNotification('Great Work! 🎉', {
                    body: `${POMODORO_CYCLES} sessions done! Time for a ${POMODORO_LONG_BREAK / 60} minute break.`,
                    tag: 'pomodoro',
                });
            } else {
                // Short break
                setIsBreak(true);
                setFocusTimer(POMODORO_SHORT_BREAK, POMODORO_SHORT_BREAK);
                showBrowserNotification('Session Complete! ☕', {
                    body: `Session ${pomodoroSession} done! Take a ${POMODORO_SHORT_BREAK / 60} minute break.`,
                    tag: 'pomodoro',
                });
            }

            setPomodoroSession(newSession);
        }
    };

    const handleStartPause = () => {
        if (isTaskMode) {
            if (isTaskRunning) {
                pauseTimer();
            } else {
                resumeTimer();
            }
        } else if (isTaskCountUpMode) {
            if (taskCountUpIsRunning) {
                pauseTaskCountUp();
            } else {
                resumeTaskCountUp();
            }
        } else {
            if (focusIsRunning) {
                pauseFocusTimer();
            } else {
                startFocusTimer();
            }
        }
    };

    const handleCompleteTaskCountUp = async () => {
        if (!taskCountUpId) return;

        // Stop the count-up timer and get elapsed time
        const elapsedSeconds = stopTaskCountUp();
        const elapsedMinutes = Math.round(elapsedSeconds / 60);

        // Complete the task with the elapsed time
        const result = await updateTaskAction({
            taskId: taskCountUpId,
            status: 'completed',
            durationMinutes: elapsedMinutes > 0 ? elapsedMinutes : undefined,
        });

        if (result.success && result.task) {
            const taskStore = useTaskStore.getState();
            taskStore.addOrUpdate(result.task as any);
        }

        // Log to deep work if meaningful time spent
        if (elapsedMinutes >= 1) {
            try {
                await logFocusSessionAction(elapsedMinutes, 'focus');
            } catch (e) {
                console.warn('Failed to log focus session:', e);
            }
        }

        showBrowserNotification('Task Completed! ✅', {
            body: `Great work! Logged ${elapsedMinutes} minutes of focus time.`,
            tag: 'task-complete',
        });

        router.push('/dashboard');
    };

    const handleReset = () => {
        if (isTaskCountUpMode) {
            // Task count-up mode - stop and clear the task count-up timer
            stopTaskCountUp();
        } else if (isTaskMode) {
            closeTimer();
        } else if (countUpMode) {
            // Count-up/stopwatch mode - reset to 0
            resetCountUp();
            pauseFocusTimer();
        } else {
            resetFocusTimer();
        }
    };

    const handlePreset = (presetSeconds: number) => {
        if (!isTaskMode && !isLocalRunning) {
            setFocusTimer(presetSeconds, presetSeconds);
            setShowCustomInput(false);
        }
    };

    const handleCustomTime = () => {
        const mins = parseInt(customMinutes);
        if (!isNaN(mins) && mins > 0 && mins <= 180) {
            const secs = mins * 60;
            setFocusTimer(secs, secs);
            setShowCustomInput(false);
            setCustomMinutes('');
        }
    };

    const handleModeChange = (newMode: TimerMode) => {
        if (isLocalRunning) return;

        setFocusMode(newMode);
        setIsBreak(false);
        setPomodoroSession(1);

        if (newMode === 'focus') {
            setFocusTimer(25 * 60, 25 * 60);
        } else if (newMode === 'break') {
            setFocusTimer(5 * 60, 5 * 60);
        } else if (newMode === 'pomodoro') {
            setFocusTimer(POMODORO_FOCUS, POMODORO_FOCUS);
        }
    };

    const handleGoHome = () => {
        router.push('/dashboard');
    };

    // Handle complete task with focus time
    const handleCompleteTask = async () => {
        if (!taskId || isEnding) return;

        setIsEnding(true);

        try {
            const state = useTimerStore.getState();
            let actualFocusMinutes = 0;

            if (state.startedAt && state.endsAt) {
                const initialDuration = Math.round(
                    (state.endsAt.getTime() - state.startedAt.getTime()) / 1000
                );
                const actualFocusSeconds = initialDuration - taskRemainingSeconds;
                actualFocusMinutes = Math.round(actualFocusSeconds / 60);
            }

            const result = await endTaskAction(taskId, actualFocusMinutes);
            if (result.success) {
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
            }
        } catch (error) {
            console.error('Failed to complete task:', error);
        }

        closeTimer();
        router.push('/dashboard');
    };

    // Calculate progress
    const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;

    // Get current presets based on mode
    const currentPresets = mode === 'break' ? BREAK_PRESETS : FOCUS_PRESETS;

    // Get mode display text
    const getModeText = () => {
        if (isTaskMode) return taskTitle || 'Task Timer';
        if (isTaskCountUpMode) return taskCountUpTitle || 'Task Count-Up';
        if (countUpMode) return 'Stopwatch';
        if (mode === 'pomodoro') {
            return isBreak
                ? `Break (Session ${pomodoroSession})`
                : `Focus (Session ${pomodoroSession})`;
        }
        return mode === 'break' ? 'Break Time' : 'Focus Timer';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center justify-center min-h-[60vh]"
        >
            <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="relative"
            >
                {/* Glow effect */}
                <div
                    className="absolute -inset-8 rounded-3xl opacity-50 blur-3xl"
                    style={{
                        background: `radial-gradient(circle, ${isBreak ? '#22c55e' : currentTheme.colors.primary}40 0%, transparent 70%)`,
                    }}
                />

                {/* Timer container */}
                <div
                    className="relative px-12 py-10 rounded-3xl backdrop-blur-xl border min-w-[400px]"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                        boxShadow: `
                            0 0 60px ${currentTheme.colors.primary}15,
                            0 25px 50px -12px ${currentTheme.colors.background}80
                        `,
                    }}
                >
                    {/* 3-Dot Menu - positioned at top right */}
                    <div className="absolute top-4 right-4" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg transition-colors hover:bg-black/10"
                            style={{ color: currentTheme.colors.mutedForeground }}
                            title="Timer options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border shadow-lg overflow-hidden"
                                style={{
                                    backgroundColor: currentTheme.colors.card,
                                    borderColor: currentTheme.colors.border,
                                }}
                            >
                                {/* Add Time Section */}
                                <div
                                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: currentTheme.colors.mutedForeground, backgroundColor: currentTheme.colors.muted }}
                                >
                                    Add Time
                                </div>
                                <div className="flex gap-1 p-2">
                                    {[
                                        { label: '+1m', seconds: 60 },
                                        { label: '+5m', seconds: 300 },
                                        { label: '+10m', seconds: 600 },
                                    ].map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => handleAddTime(item.seconds)}
                                            disabled={isTaskMode || countUpMode}
                                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: currentTheme.colors.muted,
                                                color: currentTheme.colors.foreground,
                                                opacity: (isTaskMode || countUpMode) ? 0.5 : 1,
                                            }}
                                        >
                                            <Plus className="w-3 h-3 inline mr-1" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Presets Section */}
                                <div
                                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: currentTheme.colors.mutedForeground, backgroundColor: currentTheme.colors.muted }}
                                >
                                    Set Timer
                                </div>
                                <div className="grid grid-cols-4 gap-1 p-2">
                                    {[5, 10, 15, 25, 30, 45, 60, 90].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => handleSetPreset(mins * 60)}
                                            disabled={isRunning || isTaskMode}
                                            className="px-2 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: localTotalSeconds === mins * 60 && !countUpMode
                                                    ? `${currentTheme.colors.primary}20`
                                                    : currentTheme.colors.muted,
                                                color: localTotalSeconds === mins * 60 && !countUpMode
                                                    ? currentTheme.colors.primary
                                                    : currentTheme.colors.foreground,
                                                opacity: (isRunning || isTaskMode) ? 0.5 : 1,
                                            }}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Time Input */}
                                <div
                                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: currentTheme.colors.mutedForeground, backgroundColor: currentTheme.colors.muted }}
                                >
                                    Custom Time
                                </div>
                                <div className="flex gap-1 p-2">
                                    <input
                                        type="number"
                                        placeholder="Minutes"
                                        value={menuCustomMinutes}
                                        onChange={(e) => setMenuCustomMinutes(e.target.value)}
                                        disabled={isRunning || isTaskMode}
                                        className="flex-1 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                                        style={{
                                            backgroundColor: currentTheme.colors.muted,
                                            color: currentTheme.colors.foreground,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            opacity: (isRunning || isTaskMode) ? 0.5 : 1,
                                        }}
                                        min="1"
                                        max="180"
                                        onKeyDown={(e) => e.key === 'Enter' && handleMenuCustomTime()}
                                    />
                                    <button
                                        onClick={handleMenuCustomTime}
                                        disabled={isRunning || isTaskMode || !menuCustomMinutes}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: currentTheme.colors.primary,
                                            color: currentTheme.colors.primaryForeground,
                                            opacity: (isRunning || isTaskMode || !menuCustomMinutes) ? 0.5 : 1,
                                        }}
                                    >
                                        Set
                                    </button>
                                </div>

                                {/* Divider */}
                                <div style={{ borderTop: `1px solid ${currentTheme.colors.border}` }} />

                                <button
                                    onClick={handleToggleCountUp}
                                    disabled={isTaskMode}
                                    className="w-full px-3 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2"
                                    style={{
                                        color: countUpMode ? currentTheme.colors.primary : currentTheme.colors.foreground,
                                        backgroundColor: countUpMode ? `${currentTheme.colors.primary}10` : 'transparent',
                                        opacity: isTaskMode ? 0.5 : 1,
                                    }}
                                >
                                    <ArrowUp className="w-4 h-4" />
                                    {countUpMode ? 'Switch to Countdown' : 'Switch to Count Up'}
                                </button>

                                {/* Pomodoro Settings */}
                                <div style={{ borderTop: `1px solid ${currentTheme.colors.border}` }} />
                                <div
                                    className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: currentTheme.colors.mutedForeground, backgroundColor: currentTheme.colors.muted }}
                                >
                                    Pomodoro Settings
                                </div>
                                <div className="p-2 space-y-2">
                                    {/* Focus Duration */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Focus</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={pomodoroFocusMins}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setPomodoroSettings({ focusMins: Math.min(120, Math.max(1, val)) });
                                                }}
                                                min="1"
                                                max="120"
                                                className="w-14 px-2 py-1 rounded-lg text-xs text-center outline-none"
                                                style={{
                                                    backgroundColor: currentTheme.colors.muted,
                                                    color: currentTheme.colors.foreground,
                                                    border: `1px solid ${currentTheme.colors.border}`,
                                                }}
                                            />
                                            <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>min</span>
                                        </div>
                                    </div>
                                    {/* Break Duration */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Break</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={pomodoroBreakMins}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setPomodoroSettings({ breakMins: Math.min(60, Math.max(1, val)) });
                                                }}
                                                min="1"
                                                max="60"
                                                className="w-14 px-2 py-1 rounded-lg text-xs text-center outline-none"
                                                style={{
                                                    backgroundColor: currentTheme.colors.muted,
                                                    color: currentTheme.colors.foreground,
                                                    border: `1px solid ${currentTheme.colors.border}`,
                                                }}
                                            />
                                            <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>min</span>
                                        </div>
                                    </div>
                                    {/* Auto-Start Break Toggle */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Auto-start break</span>
                                        <button
                                            onClick={() => setPomodoroSettings({ autoStartBreak: !autoStartBreak })}
                                            className="relative w-9 h-5 rounded-full transition-colors"
                                            style={{
                                                backgroundColor: autoStartBreak ? currentTheme.colors.primary : currentTheme.colors.muted,
                                            }}
                                        >
                                            <div
                                                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform"
                                                style={{ transform: autoStartBreak ? 'translateX(18px)' : 'translateX(2px)' }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Reset Timer */}
                                <button
                                    onClick={handleResetTimerMenu}
                                    disabled={isTaskMode}
                                    className="w-full px-3 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 hover:bg-red-500/10"
                                    style={{
                                        color: '#ef4444',
                                        opacity: isTaskMode ? 0.5 : 1,
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Timer
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Mode tabs (only for standalone) */}
                    {!isTaskMode && (
                        <div className="flex justify-center gap-2 mb-6">
                            {[
                                { key: 'focus', label: 'Focus', icon: Zap },
                                { key: 'break', label: 'Break', icon: Coffee },
                                { key: 'pomodoro', label: 'Pomodoro', icon: Timer },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleModeChange(key as TimerMode)}
                                    disabled={isLocalRunning}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: mode === key
                                            ? `${currentTheme.colors.primary}20`
                                            : 'transparent',
                                        color: mode === key
                                            ? currentTheme.colors.primary
                                            : currentTheme.colors.mutedForeground,
                                        opacity: isLocalRunning ? 0.5 : 1,
                                        cursor: isLocalRunning ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Timer Display */}
                    <div className="text-center">
                        {/* Mode indicator */}
                        <motion.p
                            key={getModeText()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm font-medium uppercase tracking-widest mb-4"
                            style={{ color: isBreak ? '#22c55e' : currentTheme.colors.primary }}
                        >
                            {getModeText()}
                        </motion.p>

                        {/* Time display */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-light tracking-tight"
                            style={{
                                fontSize: 'clamp(4rem, 15vw, 7rem)',
                                color: currentTheme.colors.foreground,
                                textShadow: `0 0 40px ${isBreak ? '#22c55e' : currentTheme.colors.primary}30`,
                            }}
                        >
                            {formatTime(seconds)}
                        </motion.div>

                        {/* Progress bar */}
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden mt-4"
                            style={{ backgroundColor: currentTheme.colors.muted }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    backgroundColor: isBreak ? '#22c55e' : currentTheme.colors.primary,
                                    width: `${progress}%`,
                                }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Pomodoro session dots */}
                        {mode === 'pomodoro' && !isTaskMode && (
                            <div className="flex justify-center gap-2 mt-4">
                                {Array.from({ length: POMODORO_CYCLES }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-full transition-all"
                                        style={{
                                            backgroundColor: i < (pomodoroSession - 1) % POMODORO_CYCLES
                                                ? currentTheme.colors.primary
                                                : i === (pomodoroSession - 1) % POMODORO_CYCLES && !isBreak
                                                    ? currentTheme.colors.primary
                                                    : currentTheme.colors.muted,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Status text */}
                        <motion.p
                            className="text-sm mt-4"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {isRunning
                                ? (countUpMode ? 'Stopwatch running...' : (isBreak ? 'Enjoy your break!' : 'Stay focused!'))
                                : (countUpMode
                                    ? (countUpSeconds === 0 ? 'Press play to start' : 'Stopwatch paused')
                                    : (seconds === 0 ? 'Timer complete!' : 'Press play to start'))}
                        </motion.p>
                    </div>

                    {/* Presets (only for standalone, non-pomodoro) */}
                    {!isTaskMode && mode !== 'pomodoro' && (
                        <div className="mt-6">
                            <div className="flex justify-center gap-2 flex-wrap">
                                {currentPresets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePreset(preset.seconds)}
                                        disabled={isLocalRunning}
                                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: localTotalSeconds === preset.seconds
                                                ? `${currentTheme.colors.primary}20`
                                                : currentTheme.colors.muted,
                                            color: localTotalSeconds === preset.seconds
                                                ? currentTheme.colors.primary
                                                : currentTheme.colors.mutedForeground,
                                            opacity: isLocalRunning ? 0.5 : 1,
                                        }}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                    disabled={isLocalRunning}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1"
                                    style={{
                                        backgroundColor: showCustomInput
                                            ? `${currentTheme.colors.primary}20`
                                            : currentTheme.colors.muted,
                                        color: showCustomInput
                                            ? currentTheme.colors.primary
                                            : currentTheme.colors.mutedForeground,
                                        opacity: isLocalRunning ? 0.5 : 1,
                                    }}
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Custom
                                </button>
                            </div>

                            {/* Custom time input */}
                            {showCustomInput && !isLocalRunning && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex justify-center gap-2 mt-4"
                                >
                                    <input
                                        type="number"
                                        placeholder="Minutes (1-180)"
                                        value={customMinutes}
                                        onChange={(e) => setCustomMinutes(e.target.value)}
                                        className="w-32 px-3 py-2 rounded-xl text-sm text-center outline-none"
                                        style={{
                                            backgroundColor: currentTheme.colors.muted,
                                            color: currentTheme.colors.foreground,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                        }}
                                        min="1"
                                        max="180"
                                    />
                                    <button
                                        onClick={handleCustomTime}
                                        className="px-4 py-2 rounded-xl text-sm font-medium"
                                        style={{
                                            backgroundColor: currentTheme.colors.primary,
                                            color: currentTheme.colors.primaryForeground,
                                        }}
                                    >
                                        Set
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Control buttons */}
                    <div className="flex flex-col items-center gap-4 mt-8">
                        {/* Primary row: Play/Pause + Reset */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartPause}
                                className="px-8 py-4 rounded-2xl font-medium transition-all flex items-center gap-2 text-lg"
                                style={{
                                    backgroundColor: isBreak ? '#22c55e' : currentTheme.colors.primary,
                                    color: '#fff',
                                    boxShadow: `0 8px 25px ${isBreak ? '#22c55e' : currentTheme.colors.primary}40`,
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
                                        {seconds < totalSeconds ? 'Resume' : 'Start'}
                                    </>
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReset}
                                className="p-4 rounded-2xl font-medium transition-all"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                }}
                                title="Reset timer"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Complete task button - only for task count-up mode */}
                        {isTaskCountUpMode && (
                            <motion.button
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCompleteTaskCountUp}
                                className="px-8 py-3 rounded-2xl font-medium transition-all flex items-center gap-2"
                                style={{
                                    backgroundColor: '#22c55e',
                                    color: '#fff',
                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                }}
                            >
                                <CheckCircle className="w-5 h-5" />
                                Complete Task ({Math.round(taskCountUpSeconds / 60)}m)
                            </motion.button>
                        )}

                        {/* Complete Task button (only for task mode) */}
                        {isTaskMode && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCompleteTask}
                                disabled={isEnding}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium w-full justify-center"
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
                                    <CheckCircle className="w-5 h-5" />
                                )}
                                {isEnding ? 'Completing...' : 'Complete Task'}
                            </motion.button>
                        )}

                        {/* Home button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGoHome}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
                            style={{
                                backgroundColor: currentTheme.colors.muted,
                                color: currentTheme.colors.mutedForeground,
                            }}
                        >
                            <Home className="w-4 h-4" />
                            Back to Dashboard
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}




