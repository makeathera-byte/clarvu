import { create } from 'zustand';

interface TimerState {
    taskId: string | null;
    taskTitle: string | null;
    remainingSeconds: number;
    isOpen: boolean;
    isRunning: boolean;
    startedAt: Date | null;
    endsAt: Date | null;

    // Actions
    openTimer: (taskId: string, taskTitle: string, remainingSeconds?: number) => void;
    closeTimer: () => void;
    setRemainingSeconds: (seconds: number) => void;
    decrementTimer: () => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
    taskId: null,
    taskTitle: null,
    remainingSeconds: 30 * 60, // 30 minutes default
    isOpen: false,
    isRunning: false,
    startedAt: null,
    endsAt: null,

    openTimer: (taskId: string, taskTitle: string, remainingSeconds = 30 * 60) => {
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
}));

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
