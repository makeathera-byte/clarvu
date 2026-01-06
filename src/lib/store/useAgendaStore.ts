/**
 * Agenda Blocks Store
 * Manages agenda blocks for the Intent Calendar
 * Agenda blocks are high-level planning blocks (e.g., "Deep Work", "Sales")
 */

import { create } from 'zustand';

export interface AgendaBlock {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    start_date: string; // ISO date string (YYYY-MM-DD)
    end_date: string;
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'all_day';
    color?: string;
    created_at?: string;
    updated_at?: string;
}

interface AgendaState {
    blocks: AgendaBlock[];
    isLoading: boolean;

    // Server sync
    setFromServer: (blocks: AgendaBlock[]) => void;
    setLoading: (isLoading: boolean) => void;

    // CRUD operations
    addBlock: (block: AgendaBlock) => void;
    updateBlock: (id: string, updates: Partial<AgendaBlock>) => void;
    removeBlock: (id: string) => void;

    // Query helpers
    getBlocksForDateRange: (startDate: Date, endDate: Date) => AgendaBlock[];
    getBlocksForDay: (date: Date) => AgendaBlock[];
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
    blocks: [],
    isLoading: false,

    setFromServer: (blocks) => set({ blocks, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),

    addBlock: (block) => set((state) => ({
        blocks: [...state.blocks, block]
    })),

    updateBlock: (id, updates) => set((state) => ({
        blocks: state.blocks.map((b) => b.id === id ? { ...b, ...updates } : b)
    })),

    removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id)
    })),

    getBlocksForDateRange: (startDate, endDate) => {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        return get().blocks.filter((block) => {
            // Block overlaps with date range if:
            // block.start_date <= end AND block.end_date >= start
            return block.start_date <= end && block.end_date >= start;
        });
    },

    getBlocksForDay: (date) => {
        const dayStr = date.toISOString().split('T')[0];

        return get().blocks.filter((block) => {
            return block.start_date <= dayStr && block.end_date >= dayStr;
        });
    },
}));
