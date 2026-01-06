'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { updateTaskTiming } from '@/app/calendar/actions/updateTaskTiming';
import { useTaskStore } from '@/lib/store/useTaskStore';

interface TaskBlockProps {
    task: any;
    onEdit: (task: any) => void;
    isActive?: boolean;
    liveElapsedMinutes?: number;
    isCompact?: boolean;
}

export function TaskBlock({ task, onEdit, isActive, liveElapsedMinutes, isCompact }: TaskBlockProps) {
    const { updateTaskTiming: optimisticUpdate } = useTaskStore();

    // Calculate position and height from task times
    const { top, height } = useMemo(() => {
        if (!task.start_time) return { top: 0, height: 0 };

        const startTime = new Date(task.start_time);
        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();

        let durationMinutes = 30; // Default

        if (isActive && liveElapsedMinutes !== undefined) {
            // For active tasks, use live elapsed time
            durationMinutes = liveElapsedMinutes;
        } else if (task.end_time) {
            // For completed tasks, calculate from end_time
            const endTime = new Date(task.end_time);
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
            durationMinutes = endMinutes - startMinutes;
        } else if (task.duration_minutes) {
            durationMinutes = task.duration_minutes;
        }

        // Convert to pixels (each hour = 64px for day view, 48px for week view)
        const pixelsPerHour = isCompact ? 48 : 64;
        const pixelsPerMinute = pixelsPerHour / 60;

        return {
            top: startMinutes * pixelsPerMinute,
            height: Math.max(durationMinutes * pixelsPerMinute, isCompact ? 24 : 32), // Minimum height
        };
    }, [task, isActive, liveElapsedMinutes, isCompact]);

    // Priority border styles
    const getBorderStyle = () => {
        const priority = task.priority || 'medium';
        switch (priority) {
            case 'high':
                return 'border-l-[3px]';
            case 'medium':
                return 'border-l-[2px]';
            case 'low':
                return 'border-l-[1px] opacity-70';
            default:
                return 'border-l-[2px]';
        }
    };

    // Can only drag completed tasks
    const isDraggable = task.status === 'completed';

    const handleDragEnd = async (event: any, info: any) => {
        if (!isDraggable) return;

        // Calculate new time based on drag offset
        const pixelsPerMinute = (isCompact ? 48 : 64) / 60;
        const minutesOffset = Math.round(info.offset.y / pixelsPerMinute);

        // Snap to 15-minute intervals
        const snappedOffset = Math.round(minutesOffset / 15) * 15;

        const oldStartTime = new Date(task.start_time);
        const newStartTime = new Date(oldStartTime.getTime() + snappedOffset * 60000);

        const oldEndTime = task.end_time ? new Date(task.end_time) : oldStartTime;
        const newEndTime = new Date(oldEndTime.getTime() + snappedOffset * 60000);

        // Optimistic update
        optimisticUpdate(task.id, newStartTime.toISOString(), newEndTime.toISOString());

        // Call server action
        const result = await updateTaskTiming({
            taskId: task.id,
            newStartTime: newStartTime.toISOString(),
            newEndTime: newEndTime.toISOString(),
        });

        if (!result.success) {
            // Rollback on error
            optimisticUpdate(task.id, task.start_time, task.end_time);
            console.error('Failed to update task timing:', result.error);
        }
    };

    return (
        <motion.div
            drag={isDraggable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(task)}
            className={`
                absolute left-1 right-1 rounded-md px-2 py-1
                cursor-pointer hover:opacity-90 transition-opacity
                ${getBorderStyle()}
                ${isActive ? 'ring-2 ring-primary ring-offset-1 shadow-lg' : 'shadow'}
                ${isDraggable ? 'cursor-move' : ''}
            `}
            style={{
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: task.category_color || '#6b7280',
                borderLeftColor: task.category_color || '#6b7280',
            }}
            title={`${task.title} - ${task.category_name || 'Uncategorized'}`}
        >
            <div className="text-white text-xs font-medium truncate">
                {task.title}
            </div>
            {!isCompact && height > 40 && (
                <div className="text-white/80 text-[10px] truncate">
                    {task.category_name || 'Uncategorized'}
                </div>
            )}
            {isActive && (
                <div className="text-white/90 text-[10px] mt-0.5">
                    {liveElapsedMinutes}min
                </div>
            )}
        </motion.div>
    );
}
