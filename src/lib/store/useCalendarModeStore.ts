/**
 * Calendar Mode Store
 * Manages switching between Execution and Intent calendars
 * Persists user's last selected mode to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalendarMode = 'execution' | 'intent';

interface CalendarModeState {
    mode: CalendarMode;
    setMode: (mode: CalendarMode) => void;
    toggleMode: () => void;
}

export const useCalendarModeStore = create<CalendarModeState>()(
    persist(
        (set, get) => ({
            mode: 'execution',

            setMode: (mode) => set({ mode }),

            toggleMode: () => set((state) => ({
                mode: state.mode === 'execution' ? 'intent' : 'execution'
            })),
        }),
        {
            name: 'clarvu-calendar-mode',
        }
    )
);
