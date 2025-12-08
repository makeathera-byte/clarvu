import { create } from 'zustand';

export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
    source?: string;
    external_id?: string;
    created_at: string;
}

interface CalendarState {
    events: CalendarEvent[];
    isLoading: boolean;
    setFromServer: (events: CalendarEvent[]) => void;
    addOrUpdate: (event: CalendarEvent) => void;
    remove: (id: string) => void;
    setLoading: (loading: boolean) => void;
    getTodayEvents: () => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
    events: [],
    isLoading: false,

    setFromServer: (events) => set({ events, isLoading: false }),

    addOrUpdate: (event) =>
        set((state) => {
            const existingIndex = state.events.findIndex((e) => e.id === event.id);
            if (existingIndex >= 0) {
                const newEvents = [...state.events];
                newEvents[existingIndex] = event;
                return { events: newEvents };
            }
            return { events: [...state.events, event] };
        }),

    remove: (id) =>
        set((state) => ({
            events: state.events.filter((e) => e.id !== id),
        })),

    setLoading: (isLoading) => set({ isLoading }),

    getTodayEvents: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().events.filter((e) => {
            const start = new Date(e.start_time);
            return start >= today && start < tomorrow;
        });
    },
}));
