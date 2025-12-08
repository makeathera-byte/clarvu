import { create } from 'zustand';

export interface ActiveTimer {
    id: string;
    user_id: string;
    task_id?: string;
    start_time: string;
    duration_minutes: number;
    paused_at?: string;
    is_active: boolean;
    created_at: string;
}

interface TimerState {
    activeTimer: ActiveTimer | null;
    isLoading: boolean;
    setFromServer: (timer: ActiveTimer | null) => void;
    addOrUpdate: (timer: ActiveTimer) => void;
    remove: (id: string) => void;
    clear: () => void;
    setLoading: (loading: boolean) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
    activeTimer: null,
    isLoading: false,

    setFromServer: (timer) => set({ activeTimer: timer, isLoading: false }),

    addOrUpdate: (timer) =>
        set((state) => {
            // Only track the active timer for the current user
            if (timer.is_active) {
                return { activeTimer: timer };
            }
            // If this timer was deactivated and it's our current one, clear it
            if (state.activeTimer?.id === timer.id) {
                return { activeTimer: null };
            }
            return state;
        }),

    remove: (id) =>
        set((state) => {
            if (state.activeTimer?.id === id) {
                return { activeTimer: null };
            }
            return state;
        }),

    clear: () => set({ activeTimer: null }),

    setLoading: (isLoading) => set({ isLoading }),
}));
