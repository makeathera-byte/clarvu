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
    end_time?: string | null;
    category_id?: string | null;
}


interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    setFromServer: (tasks: Task[]) => void;
    addOrUpdate: (task: Task) => void;
    remove: (id: string) => void;
    setLoading: (loading: boolean) => void;

    // Calendar-specific helpers
    getTasksByDateRange: (startDate: Date, endDate: Date) => Task[];
    getActiveTask: () => Task | null;
    updateTaskTiming: (taskId: string, startTime: string, endTime: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
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

    // Get tasks within a date range for calendar views
    getTasksByDateRange: (startDate: Date, endDate: Date) => {
        const { tasks } = get();
        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            const taskEnd = task.end_time ? new Date(task.end_time) : taskStart;

            // Include if task starts, ends, or spans the date range
            return (
                (taskStart >= startDate && taskStart <= endDate) ||
                (taskEnd >= startDate && taskEnd <= endDate) ||
                (taskStart <= startDate && taskEnd >= endDate)
            );
        });
    },

    // Get the currently active (in_progress) task
    getActiveTask: () => {
        const { tasks } = get();
        return tasks.find((task) => task.status === 'in_progress') || null;
    },

    // Optimistic update for task timing (drag & drop)
    updateTaskTiming: (taskId: string, startTime: string, endTime: string) => {
        set((state) => {
            const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return state;

            const newTasks = [...state.tasks];
            newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                start_time: startTime,
                end_time: endTime,
            };

            return { tasks: newTasks };
        });
    },
}));
