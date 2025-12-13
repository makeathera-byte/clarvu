import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
    // Task timer state
    taskId: string | null;
    taskTitle: string | null;
    remainingSeconds: number;
    isOpen: boolean;
    isRunning: boolean;
    startedAt: Date | null;
    endsAt: Date | null;

    // Standalone focus timer state (synced between dashboard and /timer)
    focusSeconds: number;
    focusTotalSeconds: number;
    focusMode: 'focus' | 'break' | 'custom' | 'pomodoro';
    focusIsRunning: boolean;
    countUpMode: boolean;
    countUpSeconds: number;

    // Task-specific count-up timer (for tracking time on individual tasks)
    taskCountUpId: string | null;
    taskCountUpTitle: string | null;
    taskCountUpSeconds: number;
    taskCountUpIsRunning: boolean;

    // Pomodoro settings (customizable)
    pomodoroFocusMins: number;
    pomodoroBreakMins: number;
    pomodoroLongBreakMins: number;
    autoStartBreak: boolean;

    // Timer display settings
    hideSeconds: boolean;

    // Task timer actions
    startTaskTimer: (taskId: string, taskTitle: string, remainingSeconds?: number) => boolean;
    restoreTaskTimer: (taskId: string, taskTitle: string, remainingSeconds: number, startedAt: Date, endsAt: Date) => void;
    openModal: () => void;
    openTimer: (taskId: string, taskTitle: string, remainingSeconds?: number) => void;
    closeTimer: () => void;
    setRemainingSeconds: (seconds: number) => void;
    decrementTimer: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;

    // Focus timer actions
    setFocusTimer: (seconds: number, totalSeconds?: number) => void;
    setFocusMode: (mode: 'focus' | 'break' | 'custom' | 'pomodoro') => void;
    startFocusTimer: () => void;
    pauseFocusTimer: () => void;
    resetFocusTimer: () => void;
    decrementFocusTimer: () => void;
    addFocusTime: (seconds: number) => void;
    toggleCountUpMode: () => void;
    incrementCountUp: () => void;
    resetCountUp: () => void;

    // Task count-up actions
    startTaskCountUp: (taskId: string, taskTitle: string) => void;
    pauseTaskCountUp: () => void;
    resumeTaskCountUp: () => void;
    incrementTaskCountUp: () => void;
    stopTaskCountUp: () => number; // Returns elapsed seconds
    getTaskCountUpState: () => { taskId: string | null; seconds: number; isRunning: boolean };

    // Pomodoro settings actions
    setPomodoroSettings: (settings: {
        focusMins?: number;
        breakMins?: number;
        longBreakMins?: number;
        autoStartBreak?: boolean;
    }) => void;

    // Timer display settings actions
    toggleHideSeconds: () => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            // Task timer state
            taskId: null,
            taskTitle: null,
            remainingSeconds: 30 * 60, // 30 minutes default
            isOpen: false,
            isRunning: false,
            startedAt: null,
            endsAt: null,

            // Focus timer state (synced between dashboard and /timer)
            focusSeconds: 25 * 60,
            focusTotalSeconds: 25 * 60,
            focusMode: 'focus' as const,
            focusIsRunning: false,
            countUpMode: false,
            countUpSeconds: 0,

            // Task-specific count-up timer
            taskCountUpId: null,
            taskCountUpTitle: null,
            taskCountUpSeconds: 0,
            taskCountUpIsRunning: false,

            // Pomodoro settings (customizable defaults)
            pomodoroFocusMins: 25,
            pomodoroBreakMins: 5,
            pomodoroLongBreakMins: 15,
            autoStartBreak: true,

            // Timer display settings
            hideSeconds: false,

            // Start a task timer without opening the fullscreen modal
            // Returns false if a task is already running
            startTaskTimer: (taskId: string, taskTitle: string, remainingSeconds = 30 * 60) => {
                // Check if a task is already running - only allow one task at a time
                const state = useTimerStore.getState();
                if (state.taskId && state.isRunning) {
                    console.log('[Timer] Cannot start new task - task already running:', state.taskTitle);
                    return false;
                }

                const now = new Date();
                const endsAt = new Date(now.getTime() + remainingSeconds * 1000);

                set({
                    taskId,
                    taskTitle,
                    remainingSeconds,
                    isOpen: false, // Don't open modal - just start timer
                    isRunning: true,
                    startedAt: now,
                    endsAt,
                });

                return true;
            },

            // Restore a task timer (paused) after page refresh
            restoreTaskTimer: (taskId: string, taskTitle: string, remainingSeconds: number, startedAt: Date, endsAt: Date) => {
                set({
                    taskId,
                    taskTitle,
                    remainingSeconds,
                    isOpen: false,
                    isRunning: false, // Start paused after restore
                    startedAt,
                    endsAt,
                });
            },

            // Open the fullscreen modal (used when user clicks expand)
            openModal: () => {
                set({ isOpen: true });
            },

            // Legacy: Start timer AND open modal (for backward compatibility)
            openTimer: (taskId: string, taskTitle: string, remainingSeconds = 30 * 60) => {
                // Check if a task is already running - only allow one task at a time
                const state = useTimerStore.getState();
                if (state.taskId && state.isRunning) {
                    console.log('[Timer] Cannot start new task - task already running:', state.taskTitle);
                    return;
                }

                const now = new Date();
                const endsAt = new Date(now.getTime() + remainingSeconds * 1000);

                set({
                    taskId,
                    taskTitle,
                    remainingSeconds,
                    isOpen: true,
                    isRunning: true,
                    startedAt: now,
                    endsAt,
                });
            },

            closeTimer: () => {
                set({
                    taskId: null,
                    taskTitle: null,
                    remainingSeconds: 30 * 60,
                    isOpen: false,
                    isRunning: false,
                    startedAt: null,
                    endsAt: null,
                });
            },

            setRemainingSeconds: (seconds: number) => {
                set({ remainingSeconds: Math.max(0, seconds) });
            },

            decrementTimer: () => {
                set((state) => ({
                    remainingSeconds: Math.max(0, state.remainingSeconds - 1),
                }));
            },

            pauseTimer: () => {
                set({ isRunning: false });
            },

            resumeTimer: () => {
                set({ isRunning: true });
            },

            // Focus timer actions
            setFocusTimer: (seconds: number, totalSeconds?: number) => {
                set({
                    focusSeconds: seconds,
                    focusTotalSeconds: totalSeconds ?? seconds,
                    countUpMode: false,
                });
            },

            setFocusMode: (mode: 'focus' | 'break' | 'custom' | 'pomodoro') => {
                const defaultSeconds = mode === 'break' ? 5 * 60 : 25 * 60;
                set({
                    focusMode: mode,
                    focusSeconds: defaultSeconds,
                    focusTotalSeconds: defaultSeconds,
                    countUpMode: false,
                });
            },

            startFocusTimer: () => {
                set({ focusIsRunning: true });
            },

            pauseFocusTimer: () => {
                set({ focusIsRunning: false });
            },

            resetFocusTimer: () => {
                set((state) => ({
                    focusIsRunning: false,
                    focusSeconds: state.countUpMode ? 0 : state.focusTotalSeconds,
                    countUpSeconds: 0,
                }));
            },

            decrementFocusTimer: () => {
                set((state) => ({
                    focusSeconds: Math.max(0, state.focusSeconds - 1),
                }));
            },

            addFocusTime: (seconds: number) => {
                set((state) => ({
                    focusSeconds: state.focusSeconds + seconds,
                    focusTotalSeconds: state.focusTotalSeconds + seconds,
                }));
            },

            toggleCountUpMode: () => {
                set((state) => ({
                    countUpMode: !state.countUpMode,
                    focusIsRunning: false,
                    countUpSeconds: 0,
                    focusSeconds: state.countUpMode ? 25 * 60 : 0,
                    focusTotalSeconds: state.countUpMode ? 25 * 60 : 0,
                }));
            },

            incrementCountUp: () => {
                set((state) => ({
                    countUpSeconds: state.countUpSeconds + 1,
                }));
            },

            resetCountUp: () => {
                set({ countUpSeconds: 0, focusIsRunning: false });
            },

            // Task count-up actions
            startTaskCountUp: (taskId: string, taskTitle: string) => {
                set({
                    taskCountUpId: taskId,
                    taskCountUpTitle: taskTitle,
                    taskCountUpSeconds: 0,
                    taskCountUpIsRunning: true,
                });
            },

            pauseTaskCountUp: () => {
                set({ taskCountUpIsRunning: false });
            },

            resumeTaskCountUp: () => {
                set({ taskCountUpIsRunning: true });
            },

            incrementTaskCountUp: () => {
                set((state) => ({
                    taskCountUpSeconds: state.taskCountUpSeconds + 1,
                }));
            },

            stopTaskCountUp: (): number => {
                const elapsed = get().taskCountUpSeconds;
                set({
                    taskCountUpId: null,
                    taskCountUpTitle: null,
                    taskCountUpSeconds: 0,
                    taskCountUpIsRunning: false,
                });
                return elapsed;
            },

            getTaskCountUpState: () => {
                return {
                    taskId: get().taskCountUpId,
                    seconds: get().taskCountUpSeconds,
                    isRunning: get().taskCountUpIsRunning,
                };
            },

            // Pomodoro settings action
            setPomodoroSettings: (settings) => {
                set((state) => ({
                    pomodoroFocusMins: settings.focusMins ?? state.pomodoroFocusMins,
                    pomodoroBreakMins: settings.breakMins ?? state.pomodoroBreakMins,
                    pomodoroLongBreakMins: settings.longBreakMins ?? state.pomodoroLongBreakMins,
                    autoStartBreak: settings.autoStartBreak ?? state.autoStartBreak,
                }));
            },

            // Timer display settings action
            toggleHideSeconds: () => {
                set((state) => ({
                    hideSeconds: !state.hideSeconds,
                }));
            },
        }),
        {
            name: 'clarvu-timer', // localStorage key
            partialize: (state) => ({
                // Task timer fields
                taskId: state.taskId,
                taskTitle: state.taskTitle,
                remainingSeconds: state.remainingSeconds,
                startedAt: state.startedAt,
                endsAt: state.endsAt,
                isRunning: false,
                isOpen: false,
                // Focus timer fields - preserve running state for stopwatch continuity
                focusSeconds: state.focusSeconds,
                focusTotalSeconds: state.focusTotalSeconds,
                focusMode: state.focusMode,
                focusIsRunning: state.focusIsRunning, // Preserve running state
                countUpMode: state.countUpMode,
                countUpSeconds: state.countUpSeconds,
                // Task-specific count-up timer fields
                taskCountUpId: state.taskCountUpId,
                taskCountUpTitle: state.taskCountUpTitle,
                taskCountUpSeconds: state.taskCountUpSeconds,
                taskCountUpIsRunning: state.taskCountUpIsRunning,
                // Pomodoro settings (persisted)
                pomodoroFocusMins: state.pomodoroFocusMins,
                pomodoroBreakMins: state.pomodoroBreakMins,
                pomodoroLongBreakMins: state.pomodoroLongBreakMins,
                autoStartBreak: state.autoStartBreak,
                // Timer display settings (persisted)
                hideSeconds: state.hideSeconds,
            }),
            onRehydrateStorage: () => (state) => {
                // Convert stored date strings back to Date objects
                if (state) {
                    if (state.startedAt && typeof state.startedAt === 'string') {
                        state.startedAt = new Date(state.startedAt);
                    }
                    if (state.endsAt && typeof state.endsAt === 'string') {
                        state.endsAt = new Date(state.endsAt);
                    }
                    // Task timer should be paused on page refresh
                    state.isRunning = false;
                    state.isOpen = false;
                    // Note: focusIsRunning is preserved for stopwatch continuity
                }
            },
        }
    )
);

// Helper function to format time
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to format time with hours
export function formatTimeWithHours(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

