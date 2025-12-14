'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { cancelTaskAction, endTaskAction, updateTaskAction, logFocusSessionAction } from '@/app/dashboard/actions';
import { showBrowserNotification } from '@/lib/notifications/push';
import { Play, Pause, RotateCcw, Clock, Coffee, Zap, Maximize2, CheckCircle, MoreVertical, Plus, Timer, ArrowUp } from 'lucide-react';

const TIMER_STATE_KEY = 'clarvu_timer_state';

interface TimerState {
    seconds: number;
    totalSeconds: number;
    mode: 'focus' | 'break' | 'custom' | 'pomodoro';
    wasRunning: boolean;
}

interface DashboardTimerProps {
    isDragging?: boolean;
    isDraggingCompleted?: boolean;
}

export function DashboardTimer({ isDragging, isDraggingCompleted }: DashboardTimerProps) {
    const { currentTheme } = useTheme();
    const router = useRouter();

    // Get all timer state from store (both task and focus timer)
    // Explicitly destructure to ensure component re-renders when these change
    const taskCountUpId = useTimerStore((state) => state.taskCountUpId);
    const taskCountUpTitle = useTimerStore((state) => state.taskCountUpTitle);
    const taskCountUpSeconds = useTimerStore((state) => state.taskCountUpSeconds);
    const taskCountUpIsRunning = useTimerStore((state) => state.taskCountUpIsRunning);

    const {
        // Task timer state
        taskId: activeTaskId,
        taskTitle: activeTaskTitle,
        remainingSeconds: taskRemainingSeconds,
        isRunning: isTaskRunning,
        isOpen: isTaskTimerOpen,
        decrementTimer,
        pauseTimer: pauseTaskTimer,
        resumeTimer: resumeTaskTimer,
        closeTimer,
        // Focus timer state (synced)
        focusSeconds,
        focusTotalSeconds,
        focusMode,
        focusIsRunning,
        countUpMode,
        countUpSeconds,
        // Task count-up actions (state already destructured above for reactivity)
        stopTaskCountUp,
        pauseTaskCountUp,
        resumeTaskCountUp,
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
        // Timer display settings
        hideSeconds,
        toggleHideSeconds,
    } = useTimerStore();

    // Hover state for expand button
    const [isHovered, setIsHovered] = useState(false);

    // UI-only local state (not synced)
    const [customMinutes, setCustomMinutes] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(focusMode === 'custom');
    const [customError, setCustomError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuCustomMinutes, setMenuCustomMinutes] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    // Detect active task timer mode - based on taskId, not isOpen (modal state)
    const isTaskMode = !!activeTaskId;
    const isTaskCountUpMode = !!taskCountUpId; // New: detect task count-up mode

    // Aliases for easier reference (store values are now the source of truth)
    const seconds = focusSeconds;
    const totalSeconds = focusTotalSeconds;
    const isRunning = focusIsRunning;
    const mode = focusMode;

    // Calculate actual task timer duration from store
    const taskTotalSeconds = (() => {
        const state = useTimerStore.getState();
        if (state.startedAt && state.endsAt) {
            return Math.round((state.endsAt.getTime() - state.startedAt.getTime()) / 1000);
        }
        return 30 * 60; // fallback to 30 min
    })();

    // Use task timer values when in task mode, task count-up when active, or count-up seconds in count-up mode
    const displaySeconds = isTaskMode ? taskRemainingSeconds : (isTaskCountUpMode ? taskCountUpSeconds : (countUpMode ? countUpSeconds : seconds));
    const displayIsRunning = isTaskMode ? isTaskRunning : (isTaskCountUpMode ? taskCountUpIsRunning : isRunning);
    const displayTotalSeconds = isTaskMode ? taskTotalSeconds : (isTaskCountUpMode ? 0 : totalSeconds); // Count-up has no total


    // Format time display
    const formatTime = (secs: number): string => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        if (hideSeconds) {
            // Show only minutes (rounded up if there are remaining seconds)
            const displayMins = remainingSecs > 0 ? mins + 1 : mins;
            return `${displayMins} min`;
        }
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    // Save timer state to localStorage before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            const state: TimerState = {
                seconds,
                totalSeconds,
                mode,
                wasRunning: isRunning,
            };
            localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [seconds, totalSeconds, mode, isRunning]);

    // Timer countdown effect for local Pomodoro timer
    useEffect(() => {
        if (isTaskMode) return; // Don't run local timer when in task mode
        if (!isRunning || countUpMode) return;

        const intervalId = setInterval(() => {
            decrementFocusTimer();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isRunning, isTaskMode, countUpMode, decrementFocusTimer]);

    // Auto-start break when focus timer reaches 0
    useEffect(() => {
        if (isTaskMode || countUpMode) return;
        if (!autoStartBreak) return;

        // Only trigger when focus timer just completed (at 0, was running, in focus mode)
        if (seconds === 0 && mode === 'focus') {
            // Switch to break mode and start the break timer
            setFocusMode('break');
            setFocusTimer(pomodoroBreakMins * 60, pomodoroBreakMins * 60);
            startFocusTimer();
        }
    }, [seconds, mode, isTaskMode, countUpMode, autoStartBreak, pomodoroBreakMins, setFocusMode, setFocusTimer, startFocusTimer]);

    // Timer countdown effect for task timer (uses store)
    useEffect(() => {
        if (!isTaskMode) return; // Only run when in task mode
        if (!isTaskRunning) return;

        const intervalId = setInterval(() => {
            decrementTimer();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isTaskMode, isTaskRunning, decrementTimer]);

    // Update current time every second
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

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

    // Count-up timer effect (stopwatch mode)
    useEffect(() => {
        if (!countUpMode || !isRunning || isTaskMode) return;

        const intervalId = setInterval(() => {
            incrementCountUp();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [countUpMode, isRunning, isTaskMode, incrementCountUp]);

    // Menu handler functions - now using store actions
    const handleAddTime = (addSeconds: number) => {
        if (isTaskMode || countUpMode) return;
        addFocusTime(addSeconds);
        setMenuOpen(false);
    };

    const handleSetPreset = (presetSeconds: number) => {
        if (isRunning || isTaskMode) return;
        setFocusTimer(presetSeconds, presetSeconds);
        setMenuOpen(false);
    };

    const handleToggleCountUp = () => {
        if (isTaskMode) return;
        toggleCountUpMode();
        setMenuOpen(false);
    };

    const handleResetTimer = () => {
        if (isTaskMode) return;
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
            setMenuCustomMinutes('');
            setMenuOpen(false);
        }
    };

    // Auto-complete task when timer reaches 0
    const hasCompletedRef = useRef(false);
    useEffect(() => {
        // Only trigger when in task mode and timer reaches 0
        if (!isTaskMode || !activeTaskId) {
            hasCompletedRef.current = false;
            return;
        }

        if (taskRemainingSeconds === 0 && !hasCompletedRef.current) {
            hasCompletedRef.current = true;

            // Calculate actual focus time (full duration since timer completed)
            const state = useTimerStore.getState();
            let actualFocusMinutes = 30; // default

            if (state.startedAt && state.endsAt) {
                // Initial duration in seconds
                const initialDuration = Math.round(
                    (state.endsAt.getTime() - state.startedAt.getTime()) / 1000
                );
                actualFocusMinutes = Math.round(initialDuration / 60);
            }

            // Auto-complete the task
            (async () => {
                const result = await endTaskAction(activeTaskId, actualFocusMinutes);
                if (result.success) {
                    // Update local task store
                    const taskStore = useTaskStore.getState();
                    const existingTask = taskStore.tasks.find(t => t.id === activeTaskId);
                    if (existingTask) {
                        taskStore.addOrUpdate({
                            ...existingTask,
                            status: 'completed',
                            end_time: new Date().toISOString(),
                            duration_minutes: actualFocusMinutes,
                        } as any);
                    }

                    // Show notification
                    showBrowserNotification('Timer Complete! 🎉', {
                        body: `Great work! Task completed with ${actualFocusMinutes} minutes of focus time.`,
                        tag: 'timer-complete',
                    });

                    // Reset timer
                    closeTimer();
                }
            })();
        }
    }, [taskRemainingSeconds, isTaskMode, activeTaskId, closeTimer]);

    const handleStartPause = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Start/Pause clicked, current isRunning:', isRunning);

        if (isTaskCountUpMode) {
            // Handle task count-up timer
            if (taskCountUpIsRunning) {
                pauseTaskCountUp();
            } else {
                resumeTaskCountUp();
            }
            return;
        }

        if (focusSeconds === 0 && !countUpMode) {
            setFocusTimer(focusTotalSeconds, focusTotalSeconds);
        }
        if (focusIsRunning) {
            pauseFocusTimer();
        } else {
            startFocusTimer();
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
    };

    const handleReset = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Reset clicked, isTaskMode:', isTaskMode, 'isTaskCountUpMode:', isTaskCountUpMode, 'countUpMode:', countUpMode);

        if (isTaskCountUpMode) {
            // Task count-up mode - stop and clear the task count-up timer
            stopTaskCountUp();
        } else if (isTaskMode && activeTaskId) {
            // In task mode - cancel the task (mark as incomplete, clear time data)
            const result = await cancelTaskAction(activeTaskId);
            if (result.success && result.task) {
                // Update local task store to reflect cancelled task
                const taskStore = useTaskStore.getState();
                taskStore.addOrUpdate(result.task);
            }
            // Close the timer (clears taskId, returns to normal timer)
            closeTimer();
        } else if (countUpMode) {
            // Count-up/stopwatch mode - reset to 0
            resetCountUp();
        } else {
            // Normal mode - reset local timer
            resetFocusTimer();
        }
    };

    const handleModeChange = (newMode: 'focus' | 'break' | 'custom') => {
        if (isRunning) return;
        if (newMode === 'custom') {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
            setFocusMode(newMode as 'focus' | 'break');
        }
    };

    const handleCustomSubmit = () => {
        const mins = parseInt(customMinutes);
        if (isNaN(mins) || mins <= 0) {
            setCustomError('Please enter a valid number');
            return;
        }
        if (mins > 500) {
            setCustomError('Maximum limit is 500 minutes');
            return;
        }
        setCustomError('');
        const newSeconds = mins * 60;
        setFocusTimer(newSeconds, newSeconds);
        setShowCustomInput(false);
    };

    // Preset buttons
    const presets = [
        { label: '15m', seconds: 15 * 60 },
        { label: '25m', seconds: 25 * 60 },
        { label: '45m', seconds: 45 * 60 },
        { label: '60m', seconds: 60 * 60 },
    ];

    const handlePresetClick = (presetSeconds: number) => {
        if (isRunning) return;
        setFocusTimer(presetSeconds, presetSeconds);
        setShowCustomInput(false);
    };

    // Progress - use display values
    const progress = displayTotalSeconds > 0 ? ((displayTotalSeconds - displaySeconds) / displayTotalSeconds) * 100 : 0;

    return (
        <div
            className="h-full rounded-2xl overflow-visible flex flex-col relative transition-all duration-200"
            style={{
                backgroundColor: currentTheme.colors.card,
                border: isDragging
                    ? `2px dashed ${currentTheme.colors.primary}`
                    : `1px solid ${currentTheme.colors.border}`,
                boxShadow: isDragging
                    ? `0 0 20px ${currentTheme.colors.primary}20`
                    : '0 4px 20px rgba(0,0,0,0.04)',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isDragging && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px]"
                    style={{ backgroundColor: isDraggingCompleted ? 'rgba(239, 68, 68, 0.1)' : `${currentTheme.colors.primary}10` }}
                >
                    <div
                        className="px-4 py-2 rounded-full text-sm font-medium animate-pulse"
                        style={{
                            backgroundColor: isDraggingCompleted ? '#ef4444' : currentTheme.colors.primary,
                            color: currentTheme.colors.primaryForeground
                        }}
                    >
                        {isDraggingCompleted ? 'Already Completed' : 'Drop to Start Task'}
                    </div>
                </div>
            )}
            {/* Header */}
            <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
            >
                <Clock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <h2 className="font-semibold text-sm" style={{ color: currentTheme.colors.foreground }}>
                    {isTaskMode ? (activeTaskTitle || 'Task Timer') : (isTaskCountUpMode ? (taskCountUpTitle || 'Task Count-Up') : 'Focus Timer')}
                </h2>

                {/* Expand Button - visible on hover */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    onClick={() => router.push('/dashboard/timer')}
                    className="p-1.5 rounded-md transition-colors hover:bg-black/10"
                    style={{
                        color: currentTheme.colors.mutedForeground,
                    }}
                    title="Expand to fullscreen"
                >
                    <Maximize2 className="w-4 h-4" />
                </motion.button>

                {/* 3-Dot Menu */}
                <div className="relative" ref={menuRef}>
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-md transition-colors hover:bg-black/10"
                        style={{
                            color: currentTheme.colors.mutedForeground,
                        }}
                        title="Timer options"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1 z-[200] min-w-[180px] rounded-xl border shadow-lg overflow-hidden"
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
                                        className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: currentTheme.colors.muted,
                                            color: currentTheme.colors.foreground,
                                            opacity: (isTaskMode || countUpMode) ? 0.5 : 1,
                                        }}
                                    >
                                        <Plus className="w-3 h-3 inline mr-0.5" />
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
                                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: totalSeconds === mins * 60 && !countUpMode
                                                ? `${currentTheme.colors.primary}20`
                                                : currentTheme.colors.muted,
                                            color: totalSeconds === mins * 60 && !countUpMode
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
                                    className="flex-1 px-2 py-1.5 rounded-lg text-xs text-center outline-none"
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
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
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

                            {/* Count Up Mode Toggle */}
                            <button
                                onClick={handleToggleCountUp}
                                disabled={isTaskMode}
                                className="w-full px-3 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-2"
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
                                {/* Hide Seconds Toggle */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>Hide seconds</span>
                                    <button
                                        onClick={toggleHideSeconds}
                                        className="relative w-9 h-5 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: hideSeconds ? currentTheme.colors.primary : currentTheme.colors.muted,
                                        }}
                                    >
                                        <div
                                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform"
                                            style={{ transform: hideSeconds ? 'translateX(18px)' : 'translateX(2px)' }}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Reset Timer */}
                            <button
                                onClick={handleResetTimer}
                                disabled={isTaskMode}
                                className="w-full px-3 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-2 hover:bg-red-500/10"
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

                {/* Mode tabs */}
                <div className="ml-auto flex gap-1">
                    <button
                        type="button"
                        onClick={() => handleModeChange('focus')}
                        disabled={isRunning}
                        className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all"
                        style={{
                            backgroundColor: mode === 'focus' ? `${currentTheme.colors.primary}20` : 'transparent',
                            color: mode === 'focus' ? currentTheme.colors.primary : currentTheme.colors.mutedForeground,
                            opacity: isRunning ? 0.5 : 1,
                        }}
                    >
                        <Zap className="w-3 h-3" />
                        Pomodoro
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('break')}
                        disabled={isRunning}
                        className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all"
                        style={{
                            backgroundColor: mode === 'break' ? `${currentTheme.colors.accent}20` : 'transparent',
                            color: mode === 'break' ? currentTheme.colors.accent : currentTheme.colors.mutedForeground,
                            opacity: isRunning ? 0.5 : 1,
                        }}
                    >
                        <Coffee className="w-3 h-3" />
                        Break
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('custom')}
                        disabled={isRunning}
                        className="px-2 py-1 rounded-md text-xs font-medium transition-all"
                        style={{
                            backgroundColor: mode === 'custom' ? `${currentTheme.colors.foreground}15` : 'transparent',
                            color: mode === 'custom' ? currentTheme.colors.foreground : currentTheme.colors.mutedForeground,
                            opacity: isRunning ? 0.5 : 1,
                        }}
                    >
                        Custom
                    </button>
                </div>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Glow */}
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at center, ${mode === 'break' ? currentTheme.colors.accent : currentTheme.colors.primary
                            }20 0%, transparent 70%)`,
                    }}
                />

                {/* Custom input */}
                {showCustomInput && !isRunning && (
                    <div className="mb-4 flex flex-col items-center gap-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={customMinutes}
                                onChange={(e) => {
                                    setCustomMinutes(e.target.value);
                                    setCustomError('');
                                }}
                                placeholder="Minutes"
                                min="1"
                                max="500"
                                className="w-24 px-3 py-2 rounded-lg text-sm text-center outline-none"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${customError ? '#ef4444' : currentTheme.colors.border}`,
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                            />
                            <button
                                type="button"
                                onClick={handleCustomSubmit}
                                className="px-3 py-2 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                }}
                            >
                                Set
                            </button>
                        </div>
                        {customError && (
                            <span className="text-xs" style={{ color: '#ef4444' }}>
                                {customError}
                            </span>
                        )}
                    </div>
                )}

                {/* Progress ring */}
                <div className="relative mb-6">
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            strokeWidth="8"
                            style={{ stroke: currentTheme.colors.muted }}
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={{
                                stroke: mode === 'break' ? currentTheme.colors.accent : currentTheme.colors.primary,
                                strokeDasharray: 553,
                                strokeDashoffset: 553 - (progress / 100) * 553,
                                transition: 'stroke-dashoffset 0.3s ease',
                            }}
                        />
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className="font-light tracking-tight tabular-nums"
                            style={{
                                fontSize: '3rem',
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            {formatTime(displaySeconds)}
                        </span>
                        <span
                            className="text-xs mt-1 truncate max-w-[150px]"
                            style={{ color: currentTheme.colors.mutedForeground }}
                            title={isTaskMode && activeTaskTitle ? activeTaskTitle : undefined}
                        >
                            {displayIsRunning
                                ? (isTaskMode ? (activeTaskTitle || 'Task in progress') : (countUpMode ? 'Stopwatch running' : (mode === 'break' ? 'Take a break!' : 'Stay focused!')))
                                : (countUpMode ? (countUpSeconds === 0 ? 'Stopwatch ready' : 'Stopwatch paused') : (displaySeconds === 0 ? 'Time\'s up!' : (isTaskMode ? 'Task paused' : 'Ready to focus')))}
                        </span>
                        <span
                            className="text-xs mt-2 tabular-nums font-medium"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {currentTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </span>
                    </div>
                </div>

                {/* Presets */}
                <div className="flex gap-2 mb-6 relative z-10">
                    {presets.map((preset) => (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => handlePresetClick(preset.seconds)}
                            disabled={isRunning}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                                backgroundColor:
                                    totalSeconds === preset.seconds && mode === 'focus'
                                        ? `${currentTheme.colors.primary}20`
                                        : currentTheme.colors.muted,
                                color:
                                    totalSeconds === preset.seconds && mode === 'focus'
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.mutedForeground,
                                opacity: isRunning ? 0.5 : 1,
                                cursor: isRunning ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            if (isTaskMode) {
                                // Task mode - use timer store pause/resume
                                if (isTaskRunning) {
                                    pauseTaskTimer();
                                } else {
                                    resumeTaskTimer();
                                }
                            } else if (isTaskCountUpMode) {
                                // Task count-up mode
                                if (taskCountUpIsRunning) {
                                    pauseTaskCountUp();
                                } else {
                                    resumeTaskCountUp();
                                }
                            } else {
                                // Normal mode
                                handleStartPause(e);
                            }
                        }}
                        className="px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer"
                        style={{
                            backgroundColor: isTaskMode ? currentTheme.colors.primary : (isTaskCountUpMode ? '#22c55e' : (mode === 'break' ? currentTheme.colors.accent : currentTheme.colors.primary)),
                            color: currentTheme.colors.primaryForeground,
                            boxShadow: `0 4px 15px ${isTaskMode ? currentTheme.colors.primary : (isTaskCountUpMode ? '#22c55e' : (mode === 'break' ? currentTheme.colors.accent : currentTheme.colors.primary))}30`,
                        }}
                    >
                        {displayIsRunning ? (
                            <>
                                <Pause className="w-4 h-4" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                {displaySeconds === 0 ? 'Restart' : displaySeconds < displayTotalSeconds ? 'Resume' : 'Start'}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-2.5 rounded-xl transition-all cursor-pointer"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            color: currentTheme.colors.mutedForeground,
                        }}
                        title="Reset timer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Complete Task button - for both task timer modes */}
                {isTaskCountUpMode && (
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCompleteTaskCountUp}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all mt-3 w-full relative z-10"
                        style={{
                            backgroundColor: '#22c55e',
                            color: '#fff',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                        }}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Complete Task ({Math.round(taskCountUpSeconds / 60)}m)
                    </motion.button>
                )}
                {isTaskMode && !isTaskCountUpMode && (
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                            if (!activeTaskId) return;

                            // Calculate elapsed time
                            const state = useTimerStore.getState();
                            let elapsedMinutes = 0;

                            if (state.startedAt && state.endsAt) {
                                const initialDuration = Math.round(
                                    (state.endsAt.getTime() - state.startedAt.getTime()) / 1000
                                );
                                const elapsedSeconds = initialDuration - taskRemainingSeconds;
                                elapsedMinutes = Math.round(elapsedSeconds / 60);
                            }

                            // Complete the task
                            const result = await endTaskAction(activeTaskId, elapsedMinutes);
                            if (result.success) {
                                const taskStore = useTaskStore.getState();
                                const existingTask = taskStore.tasks.find(t => t.id === activeTaskId);
                                if (existingTask) {
                                    taskStore.addOrUpdate({
                                        ...existingTask,
                                        status: 'completed',
                                        end_time: new Date().toISOString(),
                                        duration_minutes: elapsedMinutes,
                                    } as any);
                                }

                                showBrowserNotification('Task Completed! ✅', {
                                    body: `Great work! Logged ${elapsedMinutes} minutes of focus time.`,
                                    tag: 'task-complete',
                                });
                            }

                            closeTimer();
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all mt-3 w-full relative z-10"
                        style={{
                            backgroundColor: '#22c55e',
                            color: '#fff',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                        }}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Complete Task
                    </motion.button>
                )}
            </div>
        </div >
    );
}
