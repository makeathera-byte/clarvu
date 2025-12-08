import { create } from 'zustand';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    category?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    estimated_minutes?: number;
    actual_minutes?: number;
    scheduled_for?: string;
    completed_at?: string;
    created_at: string;
    priority?: 'low' | 'medium' | 'high';
    is_scheduled?: boolean;
    start_time?: string | null;
    category_id?: string | null;
}

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    setFromServer: (tasks: Task[]) => void;
    addOrUpdate: (task: Task) => void;
    remove: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
    tasks: [],
    isLoading: false,

    setFromServer: (tasks) => set({ tasks, isLoading: false }),

    addOrUpdate: (task) =>
        set((state) => {
            const existingIndex = state.tasks.findIndex((t) => t.id === task.id);
            if (existingIndex >= 0) {
                // Update existing
                const newTasks = [...state.tasks];
                newTasks[existingIndex] = task;
                return { tasks: newTasks };
            }
            // Add new
            return { tasks: [task, ...state.tasks] };
        }),

    remove: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        })),

    setLoading: (isLoading) => set({ isLoading }),
}));
