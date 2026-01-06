'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useCalendarModeStore } from '@/lib/store/useCalendarModeStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { useGoalsStore } from '@/lib/store/useGoalsStore';
import { CalendarModeToggle } from '@/components/calendar/CalendarModeToggle';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { ViewRenderer } from '@/components/calendar/ViewRenderer';
import { IntentCalendar } from '@/components/calendar/intent/IntentCalendar';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { fetchCalendarTasks, CalendarTask } from './actions/fetchCalendarTasks';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

interface CalendarClientProps {
    initialTasks: CalendarTask[];
    initialEvents: any[];
    initialGoals: any[];
    userId: string;
}

export function CalendarClient({
    initialTasks,
    initialEvents,
    initialGoals,
    userId
}: CalendarClientProps) {
    const { view, selectedDate } = useCalendarViewStore();
    const taskStore = useTaskStore();
    const calendarStore = useCalendarStore();
    const goalsStore = useGoalsStore();

    const [editingTask, setEditingTask] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Goal modal state
    const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
    const [clickedDate, setClickedDate] = useState<Date | undefined>(undefined);

    // Initialize stores with server data
    useEffect(() => {
        if (initialTasks.length > 0) {
            taskStore.setFromServer(initialTasks as any[]);
        }
        if (initialEvents.length > 0) {
            calendarStore.setFromServer(initialEvents);
        }
        if (initialGoals.length > 0) {
            goalsStore.setFromServer(initialGoals);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTasks, initialEvents, initialGoals]); // Only initial data, not store references

    // Polling: Refresh tasks every 20 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            // Calculate date range based on current view
            const { startDate, endDate } = getDateRangeForView(view, selectedDate);

            const result = await fetchCalendarTasks(
                startDate.toISOString(),
                endDate.toISOString()
            );

            if (result.success && result.tasks) {
                taskStore.setFromServer(result.tasks as any);
            }
        }, 20000); // 20 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, selectedDate]); // taskStore removed - using stable reference

    // Fetch tasks when view or selected date changes
    useEffect(() => {
        const loadTasks = async () => {
            const { startDate, endDate } = getDateRangeForView(view, selectedDate);

            const result = await fetchCalendarTasks(
                startDate.toISOString(),
                endDate.toISOString()
            );

            if (result.success && result.tasks) {
                taskStore.setFromServer(result.tasks as any);
            }
        };

        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, selectedDate]); // taskStore removed - using stable reference

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onEditTask: () => {
            if (selectedTaskId) {
                const task = taskStore.tasks.find(t => t.id === selectedTaskId);
                if (task) {
                    setEditingTask(task);
                    setIsEditModalOpen(true);
                }
            }
        },
        selectedTaskId,
        setSelectedTaskId,
    });

    const handleEditTask = useCallback((task: any) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    }, []);

    const { mode } = useCalendarModeStore();

    // Keyboard shortcuts for Intent calendar
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Shift+G for Create Goal
            if (e.shiftKey && e.key === 'G' && mode === 'intent') {
                e.preventDefault();
                setIsCreateGoalModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [mode]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Calendar Header with integrated mode toggle */}
            <CalendarHeader />

            <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {/* Conditional rendering based on mode */}
                {mode === 'execution' ? (
                    <ViewRenderer onEditTask={handleEditTask} />
                ) : (
                    <IntentCalendar
                        onEditGoal={(goal) => {
                            // TODO: Open goal edit modal
                            console.log('Edit goal:', goal);
                        }}
                        onCreateGoal={(date?) => {
                            setClickedDate(date);
                            setIsCreateGoalModalOpen(true);
                        }}
                    />
                )}
            </div>

            {/* Edit Task Modal (for Execution mode) */}
            {editingTask && (
                <EditTaskModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTask(null);
                    }}
                    task={editingTask}
                    onSave={async () => {
                        // Handle task update
                    }}
                />
            )}

            {/* Create Goal Modal */}
            <CreateGoalModal
                isOpen={isCreateGoalModalOpen}
                onClose={() => {
                    setIsCreateGoalModalOpen(false);
                    setClickedDate(undefined);
                }}
                initialDeadline={clickedDate}
            />
        </div>
    );
}

// Helper function to calculate date range based on view
function getDateRangeForView(view: string, selectedDate: Date) {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);

    switch (view) {
        case 'day':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            // Get start of week (Sunday)
            const day = startDate.getDay();
            startDate.setDate(startDate.getDate() - day);
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'month':
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0); // Last day of month
            endDate.setHours(23, 59, 59, 999);
            break;
    }

    return { startDate, endDate };
}
