'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';

/**
 * Custom hook for live active task growth
 * Returns elapsed minutes for the active task
 */
export function useActiveTaskGrowth() {
    const getActiveTask = useTaskStore((state) => state.getActiveTask);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const activeTask = getActiveTask();

    useEffect(() => {
        if (!activeTask || !activeTask.start_time) {
            setElapsedMinutes(0);
            return;
        }

        // Update elapsed time every second
        const interval = setInterval(() => {
            const startTime = new Date(activeTask.start_time!);
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
            setElapsedMinutes(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTask]);

    return {
        activeTask,
        elapsedMinutes,
    };
}
