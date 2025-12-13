'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { startTaskAction } from '@/app/dashboard/actions';
import { showBrowserNotification, askNotificationPermission } from '@/lib/notifications/push';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
}

interface UseTaskAutoStartOptions {
    tasks: Task[];
    onTaskAutoStarted?: (task: Task) => void;
}

/**
 * Hook to automatically start tasks when their scheduled time arrives.
 * - If user is active (tab focused): auto-starts the timer
 * - If user is away (tab not focused): shows browser notification
 */
export function useTaskAutoStart({ tasks, onTaskAutoStarted }: UseTaskAutoStartOptions) {
    const { startTaskTimer, taskId: activeTaskId } = useTimerStore();

    // Track which tasks we've already auto-started (by ID) to prevent duplicates
    const autoStartedRef = useRef<Set<string>>(new Set());

    // Track if tab is focused
    const isTabFocusedRef = useRef(true);

    // Request notification permission on mount
    useEffect(() => {
        askNotificationPermission();
    }, []);

    // Track tab focus state
    useEffect(() => {
        const handleVisibilityChange = () => {
            isTabFocusedRef.current = document.visibilityState === 'visible';
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Listen for service worker messages (notification clicks)
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'TASK_NOTIFICATION_CLICKED') {
                const { taskId, taskTitle } = event.data;
                console.log('[AutoStart] Notification clicked for task:', taskTitle);

                // Find the task and start it
                const task = tasks.find(t => t.id === taskId);
                if (task && task.status === 'scheduled') {
                    const result = await startTaskAction(taskId);
                    if (result.success) {
                        startTaskTimer(taskId, taskTitle, 30 * 60);
                        onTaskAutoStarted?.(task);
                        autoStartedRef.current.add(taskId);
                    }
                }
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
    }, [tasks, startTaskTimer, onTaskAutoStarted]);

    // Check for tasks that need to be auto-started
    const checkScheduledTasks = useCallback(async () => {
        // Don't auto-start if there's already an active task
        if (activeTaskId) return;

        const now = new Date();

        for (const task of tasks) {
            // Skip if already auto-started, not scheduled, or no start_time
            if (
                autoStartedRef.current.has(task.id) ||
                task.status !== 'scheduled' ||
                !task.start_time
            ) {
                continue;
            }

            const scheduledTime = new Date(task.start_time);
            const timeDiff = now.getTime() - scheduledTime.getTime();
            const minutesDiff = timeDiff / 60000;

            // Check if we're within the auto-start window (0 to 1 minute after scheduled time)
            if (minutesDiff >= 0 && minutesDiff <= 1) {
                // Mark as auto-started to prevent duplicates
                autoStartedRef.current.add(task.id);

                if (isTabFocusedRef.current) {
                    // User is active - auto-start the timer
                    console.log('[AutoStart] Starting task:', task.title);
                    const result = await startTaskAction(task.id);
                    if (result.success) {
                        startTaskTimer(task.id, task.title, 30 * 60);
                        onTaskAutoStarted?.(task);
                    }
                } else {
                    // User is away - show notification
                    console.log('[AutoStart] User away, showing notification for:', task.title);
                    showBrowserNotification(`Time for: ${task.title}`, {
                        body: 'Your scheduled task is ready to start. Click to begin.',
                        tag: `task-${task.id}`,
                        requireInteraction: true,
                        data: { taskId: task.id, taskTitle: task.title },
                    });
                }

                // Only start one task at a time
                break;
            }
        }
    }, [tasks, activeTaskId, startTaskTimer, onTaskAutoStarted]);

    // Run check every 30 seconds
    useEffect(() => {
        // Initial check
        checkScheduledTasks();

        // Set up interval
        const intervalId = setInterval(checkScheduledTasks, 30000);

        return () => clearInterval(intervalId);
    }, [checkScheduledTasks]);

    // Clean up old entries from autoStartedRef when tasks change
    useEffect(() => {
        const currentTaskIds = new Set(tasks.map(t => t.id));
        autoStartedRef.current.forEach(id => {
            if (!currentTaskIds.has(id)) {
                autoStartedRef.current.delete(id);
            }
        });
    }, [tasks]);
}
