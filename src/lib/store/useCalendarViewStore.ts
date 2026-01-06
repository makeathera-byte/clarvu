import { create } from 'zustand';

export type CalendarView = 'day' | 'week' | 'month' | 'year';

interface CalendarViewState {
    view: CalendarView;
    selectedDate: Date;
    isLoading: boolean;

    // Actions
    setView: (view: CalendarView) => void;
    setSelectedDate: (date: Date) => void;
    setLoading: (loading: boolean) => void;
    goToToday: () => void;
    navigateNext: () => void;
    navigatePrevious: () => void;
}

export const useCalendarViewStore = create<CalendarViewState>((set, get) => ({
    view: 'day',
    selectedDate: new Date(),
    isLoading: false,

    setView: (view) => set({ view }),

    setSelectedDate: (date) => set({ selectedDate: date }),

    setLoading: (isLoading) => set({ isLoading }),

    goToToday: () => set({ selectedDate: new Date() }),

    navigateNext: () => {
        const { view, selectedDate } = get();
        const newDate = new Date(selectedDate);

        switch (view) {
            case 'day':
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + 1);
                break;
        }

        set({ selectedDate: newDate });
    },

    navigatePrevious: () => {
        const { view, selectedDate } = get();
        const newDate = new Date(selectedDate);

        switch (view) {
            case 'day':
                newDate.setDate(newDate.getDate() - 1);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() - 7);
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() - 1);
                break;
        }

        set({ selectedDate: newDate });
    },
}));
