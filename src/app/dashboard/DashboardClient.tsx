'use client';

import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { DashboardHeader, TodayOverview, DashboardTimer, TaskRow } from '@/components/dashboard';
import { CreateTaskModal, EditTaskModal } from '@/components/tasks';
import { ActiveTimerModal } from '@/components/timer';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { createTaskAction, startTaskAction, updateTaskAction, deleteTaskAction, endTaskAction, logFocusSessionAction, fetchYesterdayIncompleteTasks } from '@/app/dashboard/actions';
import { cleanupDuplicateCategories } from '@/app/dashboard/actions/cleanupCategories';
import { getSuggestionsForUser, recordSuggestionUse, TaskSuggestion } from '@/app/tasks/suggestionsActions';
import { useTaskAutoStart } from '@/lib/hooks/useTaskAutoStart';

// Lazy load heavy components for better performance
const CategoryPieChart = lazy(() => import('@/components/dashboard').then(m => ({ default: m.CategoryPieChart })));
const TodayTimeline = lazy(() => import('@/components/dashboard').then(m => ({ default: m.TodayTimeline })));
const AISummaryCard = lazy(() => import('@/components/dashboard').then(m => ({ default: m.AISummaryCard })));
const TodayEvents = lazy(() => import('@/components/calendar').then(m => ({ default: m.TodayEvents })));
import {
    Timer as TimerIcon,
    Plus,
    Clock,
    Play,
    Eye,
    CheckCircle2,
    Circle,
    ChevronDown,
    Flag,
    Calendar,
    CalendarOff,
    MoreVertical,
    GripVertical,
    Trash2,
    Pencil,
    Check,
    X
} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority?: 'low' | 'medium' | 'high';
    is_scheduled?: boolean;
}

interface CalendarEvent {
    id: string;
    external_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
}

interface DashboardClientProps {
    initialTasks: Task[];
    userName?: string | null;
    calendarEvents: CalendarEvent[];
    userTimezone?: string;
}

export function DashboardClient({
    initialTasks,
    userName,
    calendarEvents,
    userTimezone = 'UTC',
}: DashboardClientProps) {
    const { currentTheme } = useTheme();
    const timerStore = useTimerStore();
    const { taskId: activeTaskId, startTaskTimer, closeTimer } = timerStore;

    // Quick add form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [isTaskScheduled, setIsTaskScheduled] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [showPriorityMenu, setShowPriorityMenu] = useState<string | null>(null);
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [showQuickAddPriorityMenu, setShowQuickAddPriorityMenu] = useState(false);
    const [showTaskMenu, setShowTaskMenu] = useState<string | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [timePickerKey, setTimePickerKey] = useState(0);

    // Duration selection modal state
    const [taskToStart, setTaskToStart] = useState<Task | null>(null);
    const [showDurationModal, setShowDurationModal] = useState(false);
    const [customDuration, setCustomDuration] = useState('');
    const [savedCustomDuration, setSavedCustomDuration] = useState<number | null>(null);

    // Inline time entry state (for completing tasks without timer)
    const [pendingTimeEntryTaskId, setPendingTimeEntryTaskId] = useState<string | null>(null);
    const [recentCustomTimes, setRecentCustomTimes] = useState<number[]>([]);

    // Task list menu state
    const [showTaskListMenu, setShowTaskListMenu] = useState(false);
    const [dayCleared, setDayCleared] = useState(false);
    const taskListMenuRef = useRef<HTMLDivElement>(null);

    // Confirmation states for task list menu actions
    const [confirmingAction, setConfirmingAction] = useState<'removeCompleted' | 'importYesterday' | 'clearDay' | null>(null);

    // Load saved custom duration and recent custom times
    useEffect(() => {
        const saved = localStorage.getItem('clarvu_custom_duration');
        if (saved) {
            setSavedCustomDuration(parseInt(saved));
        }
        const recentTimes = localStorage.getItem('clarvu_recent_custom_times');
        if (recentTimes) {
            try {
                setRecentCustomTimes(JSON.parse(recentTimes));
            } catch (e) { /* ignore */ }
        }
    }, []);

    // Suggestions state
    const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Initialize task store from server data
    const taskStore = useTaskStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && initialTasks.length > 0) {
            taskStore.setFromServer(initialTasks as any);
            isInitialized.current = true;
        }
    }, [initialTasks, taskStore]);

    // Auto-cleanup duplicate categories on mount
    useEffect(() => {
        cleanupDuplicateCategories().then((result) => {
            if (result.deleted > 0) {
                console.log(`Cleaned up ${result.deleted} duplicate categories`);
                window.location.reload();
            }
        });
    }, []);

    // Set default time to current time ONLY on initial load
    useEffect(() => {
        const now = new Date();
        setNewTaskTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, []); // Empty deps - only runs once on mount

    // Close category picker and priority menu on outside click
    const quickAddPriorityRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setShowCategoryPicker(false);
            }
            // Close priority menu if clicking outside
            const target = e.target as HTMLElement;
            if (!target.closest('[data-priority-menu]')) {
                setShowPriorityMenu(null);
            }
            // Close quick add priority menu if clicking outside
            if (quickAddPriorityRef.current && !quickAddPriorityRef.current.contains(e.target as Node)) {
                setShowQuickAddPriorityMenu(false);
            }
            // Close task menu if clicking outside
            if (!target.closest('[data-task-menu]')) {
                setShowTaskMenu(null);
            }
            // Close time picker if clicking outside
            if (!target.closest('[data-time-picker]')) {
                setShowTimePicker(false);
            }
            // Close task list menu if clicking outside
            if (taskListMenuRef.current && !taskListMenuRef.current.contains(e.target as Node)) {
                setShowTaskListMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Fetch suggestions when title changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (newTaskTitle.trim().length > 0) {
                const result = await getSuggestionsForUser(newTaskTitle, newTaskCategory || undefined);
                setSuggestions(result.suggestions || []);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 150);
        return () => clearTimeout(debounce);
    }, [newTaskTitle, newTaskCategory]);

    // Use tasks from store (auto-updates via realtime)
    const tasks = taskStore.tasks.length > 0 ? taskStore.tasks : initialTasks;

    // Get categories from store (single source of truth)
    const categories = useCategoryStore((s) => s.categories);

    // Auto-start scheduled tasks when their time arrives
    useTaskAutoStart({
        tasks: tasks as any,
        onTaskAutoStarted: (task) => {
            // Update local store when task is auto-started
            taskStore.addOrUpdate({
                ...task,
                status: 'in_progress',
                start_time: new Date().toISOString(),
            } as any);
        },
    });

    // Sort tasks: by status first, then by priority (high > medium > low)
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusOrder = { in_progress: 0, scheduled: 1, unscheduled: 2, completed: 3 };
        const priorityOrder = { high: 0, medium: 1, low: 2 };

        // First sort by status
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;

        // Then sort by priority (within same status)
        const aPriority = (a as any).priority || 'medium';
        const bPriority = (b as any).priority || 'medium';
        return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
    });

    const getCategory = (id: string | null) => categories.find(c => c.id === id);
    const selectedCategory = getCategory(newTaskCategory);

    const formatTime = (iso: string | null) => {
        if (!iso) return '';
        return new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: userTimezone,
        });
    };

    const handleQuickAdd = async () => {
        if (!newTaskTitle.trim()) return;

        setIsAdding(true);
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Create the start time properly in user's timezone
            const now = new Date();
            const [hours, minutes] = newTaskTime.split(':').map(Number);

            // Get current date in user's timezone
            const tzFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const tzParts = tzFormatter.formatToParts(now);
            const year = parseInt(tzParts.find(p => p.type === 'year')?.value || '0');
            const month = parseInt(tzParts.find(p => p.type === 'month')?.value || '0');
            const day = parseInt(tzParts.find(p => p.type === 'day')?.value || '0');

            // Create a date string representing the local time in user's timezone
            const localDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

            // Convert this local time to UTC
            // We'll create a date and use the timezone offset
            const tempDate = new Date(localDateStr);
            const utcTime = tempDate.getTime();

            // Get what this time would be interpreted as in the user's timezone vs UTC
            const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(tempDate.toLocaleString('en-US', { timeZone: userTimezone }));
            const offset = utcDate.getTime() - tzDate.getTime();

            // Apply the offset to get the correct UTC time
            const finalStartTime = new Date(utcTime - offset);

            // Validate: Compare local times directly (simpler and more accurate)
            // Create a local date for "now" with same format to compare properly
            const nowHours = now.getHours();
            const nowMinutes = now.getMinutes();
            const nowInMinutes = nowHours * 60 + nowMinutes;
            const selectedInMinutes = hours * 60 + minutes;

            // Task is in past if selected time is more than 1 minute before current time
            const isInPast = selectedInMinutes < nowInMinutes - 1;

            if (isTaskScheduled && isInPast) {
                alert('Cannot schedule a task in the past. Please select a future time.');
                setIsAdding(false);
                return;
            }

            // Determine if the task should start immediately
            // A task starts immediately if: it's within 1 minute of the scheduled time OR unscheduled
            const shouldStartNow = !isTaskScheduled || (Math.abs(selectedInMinutes - nowInMinutes) <= 1);

            // Optimistically add task to store immediately (before server response)
            const optimisticTask: any = {
                id: tempId,
                user_id: '', // Will be updated by server
                title: newTaskTitle.trim(),
                category_id: newTaskCategory,
                start_time: isTaskScheduled ? finalStartTime.toISOString() : null,
                status: isTaskScheduled ? (shouldStartNow ? 'in_progress' : 'scheduled') : 'unscheduled',
                priority: newTaskPriority,
                is_scheduled: isTaskScheduled,
                duration_minutes: 30,
                created_at: new Date().toISOString(),
            };

            // Add optimistically to store for immediate UI update
            taskStore.addOrUpdate(optimisticTask);

            const result = await createTaskAction({
                title: newTaskTitle.trim(),
                categoryId: newTaskCategory,
                startTime: finalStartTime.toISOString(),
                priority: newTaskPriority,
                isScheduled: isTaskScheduled,
            });

            if (result.success && result.task) {
                // Add the real task FIRST (before removing optimistic) to prevent flash
                if (result.task.id) {
                    taskStore.addOrUpdate(result.task as any);
                }

                // Now remove optimistic task (real task is already in store)
                taskStore.remove(tempId);

                // Record suggestion use for auto-learning
                await recordSuggestionUse(newTaskTitle.trim(), newTaskCategory);

                // If task should start NOW, show duration picker modal
                if (shouldStartNow && isTaskScheduled) {
                    // Set the task for the duration modal
                    setTaskToStart(result.task as any);
                    setShowDurationModal(true);
                }

                setNewTaskTitle('');
                setNewTaskCategory(null);
                setShowSuggestions(false);
                inputRef.current?.focus();
            } else {
                // Remove optimistic task on error
                taskStore.remove(tempId);
            }
        } catch (error) {
            // Remove optimistic task on error
            taskStore.remove(tempId);
            console.error('Error creating task:', error);
        } finally {
            setIsAdding(false);
        }
    };

    // Open duration selection modal instead of immediately starting
    const handleStartTask = (task: Task) => {
        setTaskToStart(task);
        setShowDurationModal(true);
    };

    // Start count-up timer for a task (time tracking without countdown)
    const handleStartTaskCountUp = (task: Task) => {
        const { startTaskCountUp } = useTimerStore.getState();
        startTaskCountUp(task.id, task.title);
    };

    // Actually start the task with selected duration
    const handleConfirmStart = async (durationMinutes: number, isCustom = false) => {
        if (!taskToStart) return;

        if (isCustom) {
            localStorage.setItem('clarvu_custom_duration', durationMinutes.toString());
            setSavedCustomDuration(durationMinutes);
            setCustomDuration(''); // Reset input
        }

        const result = await startTaskAction(taskToStart.id);
        if (result.success) {
            // Update task status in local store immediately so UI shows "running"
            taskStore.addOrUpdate({
                ...taskToStart,
                status: 'in_progress',
                start_time: new Date().toISOString(),
            } as any);
            startTaskTimer(taskToStart.id, taskToStart.title, durationMinutes * 60);
        }
        setShowDurationModal(false);
        setTaskToStart(null);
    };

    const handleToggleSchedule = async (task: Task) => {
        const currentScheduled = (task as any).is_scheduled !== false;
        const newScheduled = !currentScheduled;

        // If scheduling, set default time to now
        const startTime = newScheduled ? new Date().toISOString() : null;

        const result = await updateTaskAction({
            taskId: task.id,
            isScheduled: newScheduled,
            startTime,
        });

        if (result.success && result.task) {
            // Update task in store with server response
            taskStore.addOrUpdate(result.task as any);
        }
    };

    const handlePriorityChange = async (task: Task, priority: 'low' | 'medium' | 'high') => {
        const result = await updateTaskAction({
            taskId: task.id,
            priority,
        });

        if (result.success && result.task) {
            // Update task in store with server response
            taskStore.addOrUpdate(result.task as any);
            setShowPriorityMenu(null);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        const isActiveTask = activeTaskId === task.id;
        const state = useTimerStore.getState();

        if (task.status !== 'completed') {
            // Completing a task

            // Check if this task has an active count-up timer
            if (state.taskCountUpId === task.id) {
                // Get elapsed time from count-up and stop it
                const elapsedSeconds = state.stopTaskCountUp();
                const elapsedMinutes = Math.round(elapsedSeconds / 60);

                // Complete the task with count-up time
                const result = await updateTaskAction({
                    taskId: task.id,
                    status: 'completed',
                });
                if (result.success && result.task) {
                    taskStore.addOrUpdate(result.task as any);
                }

                // Log to deep work if meaningful time spent
                if (elapsedMinutes >= 1) {
                    try {
                        await logFocusSessionAction(elapsedMinutes, 'focus');
                    } catch (e) {
                        console.warn('Failed to log focus session:', e);
                    }
                }
                return;
            }

            if (isActiveTask) {
                // Calculate actual focused time from countdown timer
                let actualFocusMinutes: number | undefined;

                if (state.startedAt && state.endsAt) {
                    // Initial duration in seconds
                    const initialDuration = Math.round(
                        (state.endsAt.getTime() - state.startedAt.getTime()) / 1000
                    );
                    // Actual focused seconds = initial - remaining
                    const actualFocusSeconds = initialDuration - state.remainingSeconds;
                    actualFocusMinutes = Math.round(actualFocusSeconds / 60);
                }

                // If this is the running task, use endTaskAction with actual focus time
                const result = await endTaskAction(task.id, actualFocusMinutes);
                if (result.success) {
                    // Update local store immediately
                    taskStore.addOrUpdate({
                        ...task,
                        status: 'completed',
                        end_time: new Date().toISOString(),
                        duration_minutes: actualFocusMinutes || 0,
                    } as any);
                    // Reset the timer
                    closeTimer();
                }
            } else {
                // Not running - show inline time entry UI to ask for time spent
                setPendingTimeEntryTaskId(task.id);
                return; // Don't complete yet - wait for time entry
            }
        } else {
            // Uncompleting a task - set back to scheduled and clear time data
            const result = await updateTaskAction({
                taskId: task.id,
                status: 'scheduled',
            });
            if (result.success && result.task) {
                // Clear end_time and duration_minutes locally
                taskStore.addOrUpdate({
                    ...result.task,
                    end_time: null,
                    duration_minutes: null,
                } as any);
            }
        }
    };

    // Handle time entry submission - complete task with specified time
    const handleSubmitTimeEntry = async (task: Task, minutes: number) => {
        setPendingTimeEntryTaskId(null); // Clear the pending state

        // Complete the task with the entered duration
        const result = await updateTaskAction({
            taskId: task.id,
            status: 'completed',
            durationMinutes: minutes > 0 ? minutes : undefined,
        });
        if (result.success && result.task) {
            taskStore.addOrUpdate(result.task as any);
        }

        // Log to deep work if meaningful time spent
        if (minutes >= 1) {
            try {
                await logFocusSessionAction(minutes, 'focus');
            } catch (e) {
                console.warn('Failed to log focus session:', e);
            }

            // Save to recent custom times if it's a non-preset value
            if (![5, 10, 15, 25, 30].includes(minutes)) {
                const newRecent = [minutes, ...recentCustomTimes.filter(t => t !== minutes)].slice(0, 5);
                setRecentCustomTimes(newRecent);
                localStorage.setItem('clarvu_recent_custom_times', JSON.stringify(newRecent));
            }
        }
    };

    // Handle canceling time entry - don't complete the task
    const handleCancelTimeEntry = () => {
        setPendingTimeEntryTaskId(null);
    };

    const handleDeleteTask = async (taskId: string) => {
        const result = await deleteTaskAction(taskId);
        if (result.success) {
            taskStore.remove(taskId);
            setShowTaskMenu(null);
        }
    };

    // Task List Menu Actions
    const handleRemoveCompletedTasks = async () => {
        const completedTasks = tasks.filter(t => t.status === 'completed');
        for (const task of completedTasks) {
            await deleteTaskAction(task.id);
            taskStore.remove(task.id);
        }
        setConfirmingAction(null);
        setShowTaskListMenu(false);
    };

    const handleImportYesterdaysTasks = async () => {
        // Fetch yesterday's incomplete tasks from server
        const yesterdayTasks = await fetchYesterdayIncompleteTasks();

        // Reschedule them to today
        const now = new Date();
        for (const task of yesterdayTasks) {
            const result = await updateTaskAction({
                taskId: task.id,
                startTime: now.toISOString(),
            });
            if (result.success && result.task) {
                taskStore.addOrUpdate(result.task as any);
            }
        }
        setConfirmingAction(null);
        setShowTaskListMenu(false);
    };

    const handleClearTheDay = () => {
        setDayCleared(true);
        setConfirmingAction(null);
        setShowTaskListMenu(false);
    };

    const handleRestoreDay = () => {
        setDayCleared(false);
    };

    const handleCancelConfirmation = () => {
        setConfirmingAction(null);
    };

    // Edit task modal state
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
        setShowTaskMenu(null);
    };

    const handleSaveFullEdit = async (
        taskId: string,
        updates: { title: string; categoryId: string | null; priority: 'low' | 'medium' | 'high' }
    ) => {
        const result = await updateTaskAction({
            taskId,
            title: updates.title,
            categoryId: updates.categoryId,
            priority: updates.priority,
        });

        if (result.success && result.task) {
            taskStore.addOrUpdate(result.task as any);
        }
        setIsEditModalOpen(false);
        setEditingTask(null);
    };

    // Local reorder state - persists user's manual ordering via localStorage
    const TASK_ORDER_KEY = 'clarvu_task_order';
    const [localTaskOrder, setLocalTaskOrder] = useState<string[]>(() => {
        // Initialize from localStorage immediately
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(TASK_ORDER_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) { }
            }
        }
        return [];
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingCompleted, setIsDraggingCompleted] = useState(false);

    // Sync with sortedTasks only when tasks are added/removed (not on initial load)
    const prevTaskCount = useRef(sortedTasks.length);
    const currentTaskIds = useMemo(() => new Set(sortedTasks.map(t => t.id)), [sortedTasks]);

    useEffect(() => {
        const localIds = new Set(localTaskOrder);

        // Check if tasks were added or removed (by ID, not just count)
        const hasNewTasks = sortedTasks.some(t => !localIds.has(t.id));
        const hasRemovedTasks = localTaskOrder.some(id => !currentTaskIds.has(id));

        if (localTaskOrder.length === 0) {
            // First load - use sortedTasks order
            const order = sortedTasks.map(t => t.id);
            setLocalTaskOrder(order);
            localStorage.setItem(TASK_ORDER_KEY, JSON.stringify(order));
        } else if (hasNewTasks || hasRemovedTasks) {
            // Tasks changed - preserve order, remove deleted, add new at end
            const existingOrder = localTaskOrder.filter(id => currentTaskIds.has(id));
            const newTaskIds = sortedTasks
                .filter(t => !localIds.has(t.id))
                .map(t => t.id);
            const newOrder = [...existingOrder, ...newTaskIds];
            setLocalTaskOrder(newOrder);
            localStorage.setItem(TASK_ORDER_KEY, JSON.stringify(newOrder));
        }
    }, [sortedTasks, localTaskOrder, currentTaskIds]);

    // Reorder tasks by local order
    const displayTasks = useMemo(() => {
        if (localTaskOrder.length === 0) return sortedTasks;
        return localTaskOrder
            .map(id => sortedTasks.find(t => t.id === id))
            .filter(Boolean) as typeof sortedTasks;
    }, [localTaskOrder, sortedTasks]);

    const handleReorder = useCallback((newOrder: typeof sortedTasks) => {
        const orderIds = newOrder.map(t => t.id);
        setLocalTaskOrder(orderIds);
        localStorage.setItem(TASK_ORDER_KEY, JSON.stringify(orderIds));
    }, []);

    const timerRef = useRef<HTMLDivElement>(null);

    // Check if drop point is within timer bounds
    const checkDropOnTimer = (point: { x: number; y: number }, task: Task) => {
        if (!timerRef.current) return;

        const timerRect = timerRef.current.getBoundingClientRect();
        if (
            point.x >= timerRect.left &&
            point.x <= timerRect.right &&
            point.y >= timerRect.top &&
            point.y <= timerRect.bottom
        ) {
            // Don't start completed tasks
            if (task.status === 'completed') {
                return;
            }
            handleStartTask(task);
        }
    };

    return (
        <>
            <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <DashboardHeader userName={userName} />

                    {/* ═══════════════════════════════════════════════════════════
                        SPLIT LAYOUT - Tasks (Left) + Timer (Right)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* LEFT HALF - Timer */}
                        <motion.div
                            ref={timerRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:sticky lg:top-32 z-10"
                            style={{ maxHeight: 'calc(100vh - 200px)' }}
                        >
                            <DashboardTimer isDragging={isDragging} isDraggingCompleted={isDraggingCompleted} />
                        </motion.div>

                        {/* RIGHT HALF - Task Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl overflow-visible flex flex-col"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                border: `1px solid ${currentTheme.colors.border}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                maxHeight: 'calc(100vh - 200px)',
                            }}
                        >
                            {/* Quick Add Row */}
                            <div
                                className="p-4 flex flex-wrap gap-2 items-center relative"
                                style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (!showSuggestions || suggestions.length === 0) {
                                            if (e.key === 'Enter') handleQuickAdd();
                                            return;
                                        }
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            setSelectedSuggestionIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0);
                                        } else if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const selected = suggestions[selectedSuggestionIndex];
                                            setNewTaskTitle(selected.text);
                                            if (selected.category_id) setNewTaskCategory(selected.category_id);
                                            setShowSuggestions(false);
                                        } else if (e.key === 'Escape') {
                                            e.preventDefault();
                                            setShowSuggestions(false);
                                        }
                                    }}
                                    placeholder="Add a task..."
                                    className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                                    style={{ color: currentTheme.colors.foreground }}
                                />

                                {/* Suggestions dropdown - positioned below input, with distinct styling */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div
                                        className="absolute left-0 mt-1 rounded-xl border z-[200] max-h-60 overflow-y-auto"
                                        style={{
                                            top: '100%',
                                            width: 'calc(100% - 200px)',
                                            backgroundColor: `${currentTheme.colors.background}95`,
                                            borderColor: `${currentTheme.colors.primary}20`,
                                            boxShadow: `0 8px 32px ${currentTheme.colors.primary}10`,
                                            backdropFilter: 'blur(16px)',
                                        }}
                                        onClick={(e) => {
                                            // Close priority menu when clicking suggestions
                                            setShowQuickAddPriorityMenu(false);
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            className="px-3 py-2 border-b text-xs font-medium flex items-center gap-2"
                                            style={{
                                                borderColor: `${currentTheme.colors.primary}20`,
                                                color: currentTheme.colors.primary
                                            }}
                                        >
                                            <span>✨ Suggestions</span>
                                            <span className="opacity-50">({suggestions.length})</span>
                                        </div>

                                        {suggestions.map((suggestion, index) => {
                                            const category = categories.find(c => c.id === suggestion.category_id);
                                            const isSelected = index === selectedSuggestionIndex;

                                            return (
                                                <button
                                                    key={suggestion.id}
                                                    onClick={() => {
                                                        setNewTaskTitle(suggestion.text);
                                                        if (suggestion.category_id) setNewTaskCategory(suggestion.category_id);
                                                        setShowSuggestions(false);
                                                        inputRef.current?.focus();
                                                    }}
                                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-all"
                                                    style={{
                                                        backgroundColor: isSelected ? `${currentTheme.colors.primary}20` : 'transparent',
                                                        color: currentTheme.colors.foreground,
                                                        borderLeft: isSelected ? `3px solid ${currentTheme.colors.primary}` : '3px solid transparent',
                                                    }}
                                                >
                                                    {category && (
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                                                    )}
                                                    <span className="flex-1">{suggestion.text}</span>
                                                    {suggestion.is_global && (
                                                        <span
                                                            className="text-xs px-1.5 py-0.5 rounded-full"
                                                            style={{
                                                                backgroundColor: `${currentTheme.colors.primary}15`,
                                                                color: currentTheme.colors.primary,
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}

                                        {/* Footer hint */}
                                        <div
                                            className="px-3 py-1.5 border-t text-xs"
                                            style={{
                                                borderColor: `${currentTheme.colors.primary}15`,
                                                color: currentTheme.colors.mutedForeground,
                                            }}
                                        >
                                            ↑↓ Navigate • Enter Select • Esc Close
                                        </div>
                                    </div>
                                )}

                                {/* Schedule Toggle */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                        Schedule
                                    </span>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsTaskScheduled(!isTaskScheduled)}
                                        className="relative w-11 h-6 rounded-full transition-colors"
                                        style={{
                                            backgroundColor: isTaskScheduled ? currentTheme.colors.primary : currentTheme.colors.muted,
                                        }}
                                        title={isTaskScheduled ? 'Scheduled - Click to unschedule' : 'Unscheduled - Click to schedule'}
                                    >
                                        <motion.div
                                            animate={{ x: isTaskScheduled ? 22 : 2 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                        />
                                    </motion.button>
                                </div>

                                {/* Time - Only show when scheduled */}
                                {isTaskScheduled && (
                                    <div className="relative shrink-0" data-time-picker>
                                        <button
                                            onClick={() => {
                                                if (!showTimePicker) {
                                                    setTimePickerKey(k => k + 1); // Force fresh times
                                                }
                                                setShowTimePicker(!showTimePicker);
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors"
                                            style={{
                                                backgroundColor: currentTheme.colors.muted,
                                                color: currentTheme.colors.foreground,
                                            }}
                                        >
                                            <Clock className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                            <span>{newTaskTime || '--:--'}</span>
                                            <ChevronDown className="w-3 h-3" />
                                        </button>

                                        {showTimePicker && (
                                            <motion.div
                                                key={timePickerKey}
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute right-0 top-full mt-1 p-3 rounded-lg z-[300] min-w-[180px]"
                                                style={{
                                                    backgroundColor: currentTheme.colors.card,
                                                    border: `1px solid ${currentTheme.colors.border}`,
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                }}
                                            >
                                                {/* Now button */}
                                                <button
                                                    onClick={() => {
                                                        const now = new Date();
                                                        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                                        setNewTaskTime(currentTime);
                                                        setShowTimePicker(false);
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors mb-3"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.primary,
                                                        color: currentTheme.colors.primaryForeground,
                                                    }}
                                                >
                                                    ⚡ Now
                                                </button>

                                                {/* Hour and Minute selectors */}
                                                {(() => {
                                                    const now = new Date();
                                                    const currentHour = now.getHours();
                                                    const currentMin = now.getMinutes();
                                                    const [selectedHour, selectedMin] = (newTaskTime || '00:00').split(':').map(Number);

                                                    // Generate hours from current hour to 23
                                                    const hours: number[] = [];
                                                    for (let h = currentHour; h < 24; h++) {
                                                        hours.push(h);
                                                    }

                                                    // Generate minutes (0-59 for future hours, or currentMin+ for current hour)
                                                    const minutes: number[] = [];
                                                    const minStart = selectedHour === currentHour ? currentMin : 0;
                                                    for (let m = minStart; m < 60; m++) {
                                                        minutes.push(m);
                                                    }

                                                    const formatHour12 = (h: number) => {
                                                        const period = h >= 12 ? 'PM' : 'AM';
                                                        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                                        return `${displayHour} ${period}`;
                                                    };

                                                    return (
                                                        <div className="flex gap-2">
                                                            {/* Hour select */}
                                                            <select
                                                                value={selectedHour}
                                                                onChange={(e) => {
                                                                    const newHour = parseInt(e.target.value);
                                                                    // Reset minute if switching to current hour and current min is higher
                                                                    let newMin = selectedMin;
                                                                    if (newHour === currentHour && selectedMin < currentMin) {
                                                                        newMin = currentMin;
                                                                    }
                                                                    setNewTaskTime(`${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
                                                                }}
                                                                className="flex-1 px-2 py-2 rounded-lg text-sm outline-none cursor-pointer"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.muted,
                                                                    color: currentTheme.colors.foreground,
                                                                    border: `1px solid ${currentTheme.colors.border}`,
                                                                }}
                                                            >
                                                                {hours.map(h => (
                                                                    <option key={h} value={h}>{formatHour12(h)}</option>
                                                                ))}
                                                            </select>

                                                            <span className="text-lg font-bold self-center" style={{ color: currentTheme.colors.foreground }}>:</span>

                                                            {/* Minute select */}
                                                            <select
                                                                value={selectedMin}
                                                                onChange={(e) => {
                                                                    const newMin = parseInt(e.target.value);
                                                                    setNewTaskTime(`${selectedHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
                                                                    setShowTimePicker(false);
                                                                }}
                                                                className="flex-1 px-2 py-2 rounded-lg text-sm outline-none cursor-pointer"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.muted,
                                                                    color: currentTheme.colors.foreground,
                                                                    border: `1px solid ${currentTheme.colors.border}`,
                                                                }}
                                                            >
                                                                {minutes.map(m => (
                                                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })()}
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {/* Priority Picker */}
                                <div className="relative shrink-0 z-[250]" ref={quickAddPriorityRef}>
                                    <button
                                        onClick={() => {
                                            setShowQuickAddPriorityMenu(!showQuickAddPriorityMenu);
                                            setShowSuggestions(false); // Close suggestions when opening priority
                                        }}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
                                        style={{
                                            backgroundColor: currentTheme.colors.muted,
                                            color: currentTheme.colors.foreground,
                                        }}
                                        title={`Priority: ${newTaskPriority}`}
                                    >
                                        <Flag
                                            className="w-4 h-4"
                                            style={{
                                                color: newTaskPriority === 'high' ? '#ef4444' :
                                                    newTaskPriority === 'medium' ? '#facc15' : '#3b82f6'
                                            }}
                                        />
                                        <ChevronDown className="w-3 h-3" />
                                    </button>

                                    {/* Priority Menu */}
                                    {showQuickAddPriorityMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute right-0 top-full mt-1 py-1 rounded-lg z-[250] min-w-32 shadow-lg"
                                            style={{
                                                backgroundColor: currentTheme.colors.card,
                                                border: `1px solid ${currentTheme.colors.border}`,
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {(['high', 'medium', 'low'] as const).map((p) => {
                                                const pColor = p === 'high' ? '#ef4444' : p === 'medium' ? '#facc15' : '#3b82f6';
                                                const pLabel = p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low';
                                                const isSelected = newTaskPriority === p;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setNewTaskPriority(p);
                                                            setShowQuickAddPriorityMenu(false);
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                        style={{
                                                            backgroundColor: isSelected ? `${pColor}10` : 'transparent',
                                                            color: currentTheme.colors.foreground,
                                                        }}
                                                    >
                                                        <Flag className="w-4 h-4" style={{ color: pColor }} />
                                                        <span>{pLabel}</span>
                                                        {isSelected && <span className="ml-auto text-xs">✓</span>}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Category Picker */}
                                <div className="relative z-[240]" ref={categoryRef}>
                                    <button
                                        onClick={() => {
                                            setShowCategoryPicker(!showCategoryPicker);
                                            setShowQuickAddPriorityMenu(false); // Close priority when opening category
                                            setShowSuggestions(false); // Close suggestions when opening category
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                        style={{
                                            backgroundColor: selectedCategory ? `${selectedCategory.color}15` : currentTheme.colors.muted,
                                            color: selectedCategory ? selectedCategory.color : currentTheme.colors.mutedForeground,
                                        }}
                                    >
                                        {selectedCategory ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                                                {selectedCategory.name}
                                            </>
                                        ) : (
                                            'Category'
                                        )}
                                        <ChevronDown className="w-3 h-3" />
                                    </button>

                                    {showCategoryPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute top-full right-0 mt-1 py-1 rounded-lg z-[100] min-w-32"
                                            style={{
                                                backgroundColor: currentTheme.colors.card,
                                                border: `1px solid ${currentTheme.colors.border}`,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            }}
                                        >
                                            <button
                                                onClick={() => { setNewTaskCategory(null); setShowCategoryPicker(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 transition-colors"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                None
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setNewTaskCategory(cat.id); setShowCategoryPicker(false); }}
                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                    style={{ color: currentTheme.colors.foreground }}
                                                >
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Add Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleQuickAdd}
                                    disabled={isAdding || !newTaskTitle.trim()}
                                    className="p-2 rounded-lg shrink-0"
                                    style={{
                                        backgroundColor: newTaskTitle.trim() ? currentTheme.colors.primary : currentTheme.colors.muted,
                                        color: newTaskTitle.trim() ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground,
                                    }}
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Task List Header with Menu */}
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-xs font-medium" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Today's Tasks ({sortedTasks.length})
                                </span>
                                <div ref={taskListMenuRef} className="relative">
                                    <button
                                        onClick={() => setShowTaskListMenu(!showTaskListMenu)}
                                        className="p-1 rounded-md hover:bg-black/5 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                    </button>

                                    <AnimatePresence>
                                        {showTaskListMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute right-0 top-full mt-1 z-[100] min-w-[200px] rounded-xl border shadow-lg overflow-hidden"
                                                style={{
                                                    backgroundColor: currentTheme.colors.card,
                                                    borderColor: currentTheme.colors.border,
                                                }}
                                            >
                                                {confirmingAction === 'removeCompleted' ? (
                                                    <div className="p-2">
                                                        <p className="text-xs mb-2" style={{ color: currentTheme.colors.foreground }}>
                                                            Delete all completed tasks?
                                                        </p>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={handleRemoveCompletedTasks}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.destructive || '#ef4444',
                                                                    color: '#fff',
                                                                }}
                                                            >
                                                                Yes, Delete
                                                            </button>
                                                            <button
                                                                onClick={handleCancelConfirmation}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                                                                style={{ backgroundColor: currentTheme.colors.muted }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : confirmingAction === 'importYesterday' ? (
                                                    <div className="p-2">
                                                        <p className="text-xs mb-2" style={{ color: currentTheme.colors.foreground }}>
                                                            Import incomplete tasks from yesterday?
                                                        </p>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={handleImportYesterdaysTasks}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.primary,
                                                                    color: currentTheme.colors.primaryForeground,
                                                                }}
                                                            >
                                                                Yes, Import
                                                            </button>
                                                            <button
                                                                onClick={handleCancelConfirmation}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                                                                style={{ backgroundColor: currentTheme.colors.muted }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : confirmingAction === 'clearDay' ? (
                                                    <div className="p-2">
                                                        <p className="text-xs mb-2" style={{ color: currentTheme.colors.foreground }}>
                                                            Hide all tasks for today?
                                                        </p>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={handleClearTheDay}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.destructive || '#ef4444',
                                                                    color: '#fff',
                                                                }}
                                                            >
                                                                Yes, Clear
                                                            </button>
                                                            <button
                                                                onClick={handleCancelConfirmation}
                                                                className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                                                                style={{ backgroundColor: currentTheme.colors.muted }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmingAction('removeCompleted')}
                                                            className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                            style={{ color: currentTheme.colors.foreground }}
                                                        >
                                                            <Trash2 className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                                            Remove Completed
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingAction('importYesterday')}
                                                            className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                            style={{ color: currentTheme.colors.foreground }}
                                                        >
                                                            <Calendar className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                                            Import Yesterday's Incomplete
                                                        </button>
                                                        <div style={{ borderTop: `1px solid ${currentTheme.colors.border}` }} />
                                                        {dayCleared ? (
                                                            <button
                                                                onClick={handleRestoreDay}
                                                                className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                                style={{ color: currentTheme.colors.primary }}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Restore Day
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmingAction('clearDay')}
                                                                className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                                style={{ color: currentTheme.colors.destructive || '#ef4444' }}
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Clear the Day
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Task List */}
                            <div
                                className={`flex-1 ${isDragging ? 'overflow-visible' : 'overflow-y-auto'}`}
                                style={{ borderColor: currentTheme.colors.border }}>
                                {dayCleared ? (
                                    <div className="py-12 text-center">
                                        <Eye className="w-10 h-10 mx-auto mb-3" style={{ color: currentTheme.colors.muted }} />
                                        <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                            Day cleared. Tasks are hidden.
                                        </p>
                                        <button
                                            onClick={handleRestoreDay}
                                            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                                            style={{
                                                backgroundColor: currentTheme.colors.primary,
                                                color: currentTheme.colors.primaryForeground,
                                            }}
                                        >
                                            Restore Day
                                        </button>
                                    </div>
                                ) : sortedTasks.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Circle className="w-10 h-10 mx-auto mb-3" style={{ color: currentTheme.colors.muted }} />
                                        <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                            No tasks yet. Add one above!
                                        </p>
                                    </div>
                                ) : (
                                    <Reorder.Group
                                        axis="y"
                                        values={displayTasks}
                                        onReorder={handleReorder}
                                        className="divide-y"
                                        style={{ borderColor: currentTheme.colors.border }}
                                    >
                                        {displayTasks.map((task) => {
                                            const cat = getCategory((task as any).category_id);
                                            const isActive = activeTaskId === task.id;
                                            const isCompleted = task.status === 'completed';
                                            const isInProgress = task.status === 'in_progress';
                                            const isUnscheduled = task.status === 'unscheduled' || (!(task as any).is_scheduled && !(task as any).start_time);
                                            const priority = (task as any).priority || 'medium';

                                            // Priority colors and icons
                                            const priorityConfig = {
                                                high: { color: '#ef4444', icon: Flag, label: 'High' },
                                                medium: { color: '#facc15', icon: Flag, label: 'Medium' },
                                                low: { color: '#3b82f6', icon: Flag, label: 'Low' },
                                            };
                                            const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

                                            return (
                                                <TaskRow
                                                    key={task.id}
                                                    task={task as any}
                                                    activeTaskId={activeTaskId}
                                                    categories={categories}
                                                    onStart={handleStartTask}
                                                    onToggleComplete={handleToggleComplete}
                                                    onToggleSchedule={handleToggleSchedule}
                                                    onOpenEdit={handleOpenEditModal}
                                                    onDelete={handleDeleteTask}
                                                    onPriorityChange={handlePriorityChange}
                                                    onStartCountUp={handleStartTaskCountUp}
                                                    onDragStart={() => {
                                                        setIsDragging(true);
                                                        setIsDraggingCompleted(task.status === 'completed');
                                                    }}
                                                    onDragEnd={(info, droppedTask) => {
                                                        setIsDragging(false);
                                                        setIsDraggingCompleted(false);
                                                        checkDropOnTimer(info.point, droppedTask);
                                                    }}
                                                    showMenuId={showTaskMenu}
                                                    onSetShowMenu={setShowTaskMenu}
                                                    showPriorityMenuId={showPriorityMenu}
                                                    onSetShowPriorityMenu={setShowPriorityMenu}
                                                    showTimeEntry={pendingTimeEntryTaskId === task.id}
                                                    onSubmitTime={handleSubmitTimeEntry}
                                                    onCancelTimeEntry={() => handleCancelTimeEntry()}
                                                    recentCustomTimes={recentCustomTimes}
                                                />
                                            );

                                        })}
                                    </Reorder.Group>
                                )}
                            </div>
                        </motion.div>

                    </div >



                    <TodayOverview tasks={tasks as any} categories={categories} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid lg:grid-cols-2 gap-6 mb-8"
                    >
                        {/* Left Column: Category + Calendar stacked */}
                        <div className="space-y-4">
                            <CategoryPieChart tasks={tasks as any} categories={categories} />
                            <TodayEvents events={calendarEvents} />
                        </div>
                        {/* Right Column: Timeline */}
                        <TodayTimeline tasks={tasks as any} categories={categories} />
                    </motion.div>

                    {/* AI Summary - At the bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <AISummaryCard />
                    </motion.div>
                </div >
            </main >

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <ActiveTimerModal />
            <EditTaskModal
                task={editingTask as any}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveFullEdit}
            />

            {/* Duration Selection Modal */}
            <AnimatePresence>
                {showDurationModal && taskToStart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowDurationModal(false);
                            setTaskToStart(null);
                        }}
                    >
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            style={{ backgroundColor: `${currentTheme.colors.background}80` }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm rounded-2xl border p-6"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                                boxShadow: `0 25px 50px -12px ${currentTheme.colors.background}90`,
                            }}
                        >
                            <h3
                                className="text-lg font-semibold mb-2"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                How long will this take?
                            </h3>
                            <p
                                className="text-sm mb-4 truncate"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                {taskToStart.title}
                            </p>

                            <div className="space-y-4">
                                {/* Quick Options */}
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: currentTheme.colors.mutedForeground }}>
                                        Quick Select
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[5, 10, 15, 20].map((mins) => (
                                            <motion.button
                                                key={mins}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleConfirmStart(mins)}
                                                className="py-2.5 rounded-xl text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${currentTheme.colors.primary}10`,
                                                    color: currentTheme.colors.primary,
                                                    border: `1px solid ${currentTheme.colors.primary}20`,
                                                }}
                                            >
                                                {mins}m
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Standard Options */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[25, 30, 45, 60, 90, 120].map((mins) => (
                                        <motion.button
                                            key={mins}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleConfirmStart(mins)}
                                            className="py-2.5 rounded-xl text-sm font-medium"
                                            style={{
                                                backgroundColor: currentTheme.colors.muted,
                                                color: currentTheme.colors.mutedForeground,
                                            }}
                                        >
                                            {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Last Used Custom */}
                                {savedCustomDuration && (
                                    <motion.button
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        onClick={() => handleConfirmStart(savedCustomDuration)}
                                        className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                        style={{
                                            backgroundColor: `${currentTheme.colors.accent}15`,
                                            color: currentTheme.colors.accent,
                                            border: `1px dashed ${currentTheme.colors.accent}40`,
                                        }}
                                    >
                                        <Clock className="w-3 h-3" />
                                        Last used: {savedCustomDuration} min
                                    </motion.button>
                                )}

                                {/* Custom Input */}
                                <div>
                                    <label className="text-xs font-medium mb-2 block" style={{ color: currentTheme.colors.mutedForeground }}>
                                        Custom Duration
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Minutes"
                                            value={customDuration}
                                            onChange={(e) => setCustomDuration(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customDuration) {
                                                    handleConfirmStart(parseInt(customDuration), true);
                                                }
                                            }}
                                            className="flex-1 h-10 px-3 rounded-xl border text-sm outline-none transition-all focus:border-primary"
                                            style={{
                                                backgroundColor: currentTheme.colors.muted,
                                                color: currentTheme.colors.foreground,
                                                borderColor: 'transparent',
                                            }}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={!customDuration}
                                            onClick={() => customDuration && handleConfirmStart(parseInt(customDuration), true)}
                                            className="px-4 rounded-xl font-medium text-sm disabled:opacity-50"
                                            style={{
                                                backgroundColor: currentTheme.colors.primary,
                                                color: currentTheme.colors.primaryForeground,
                                            }}
                                        >
                                            Start
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Or start count-up timer */}
                            <div
                                className="pt-3 mt-3"
                                style={{ borderTop: `1px dashed ${currentTheme.colors.border}` }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                        if (taskToStart) {
                                            handleStartTaskCountUp(taskToStart);
                                            setShowDurationModal(false);
                                            setTaskToStart(null);
                                        }
                                    }}
                                    className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.accent}15`,
                                        color: currentTheme.colors.accent,
                                        border: `1px solid ${currentTheme.colors.accent}30`,
                                    }}
                                >
                                    <TimerIcon className="w-4 h-4" />
                                    Start Count Up Instead
                                </motion.button>
                                <p
                                    className="text-xs text-center mt-1.5"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    Track time without a countdown
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                    setShowDurationModal(false);
                                    setTaskToStart(null);
                                }}
                                className="w-full mt-4 py-2 rounded-xl text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Cancel
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
