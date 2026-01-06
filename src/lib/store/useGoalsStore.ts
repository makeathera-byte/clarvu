/**
 * Goals Store
 * Manages goals state for the Intent Calendar
 * Goals represent user's planned objectives (7d, 30d, 365d)
 */

import { create } from 'zustand';

export interface Goal {
    id: string;
    user_id: string;
    period: '7d' | '30d' | '365d';
    goal_text: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'failed';
    priority?: 'high' | 'medium' | 'low';
    progress_percentage?: number;
    notes?: string;
    sub_goals?: Array<{ id: string; text: string; completed: boolean }>;
    created_at?: string;
    updated_at?: string;
}

interface GoalsState {
    goals: Goal[];
    isLoading: boolean;

    // Server sync
    setFromServer: (goals: Goal[]) => void;
    setLoading: (isLoading: boolean) => void;

    // CRUD operations
    addGoal: (goal: Goal) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;

    // Query helpers
    getGoalsByPeriod: (period: '7d' | '30d' | '365d') => Goal[];
    getActiveGoals: () => Goal[];
    getGoalsInDateRange: (startDate: Date, endDate: Date) => Goal[];
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
    goals: [],
    isLoading: false,

    setFromServer: (goals) => set({ goals, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),

    addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
    })),

    updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g)
    })),

    removeGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
    })),

    getGoalsByPeriod: (period) => {
        return get().goals.filter((g) => g.period === period && g.status === 'active');
    },

    getActiveGoals: () => {
        return get().goals.filter((g) => g.status === 'active');
    },

    getGoalsInDateRange: (startDate, endDate) => {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        return get().goals.filter((goal) => {
            // Goal overlaps with date range if:
            // goal.start_date <= end AND goal.end_date >= start
            return goal.start_date <= end && goal.end_date >= start && goal.status === 'active';
        });
    },
}));
