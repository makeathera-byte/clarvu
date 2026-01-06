'use client';

import { useMemo } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { TaskBlock } from './TaskBlock';
import { GoogleEventBlock } from './GoogleEventBlock';
import { useActiveTaskGrowth } from '@/lib/hooks/useActiveTaskGrowth';

interface DayViewProps {
    onEditTask: (task: any) => void;
}

export function DayView({ onEditTask }: DayViewProps) {
    const { selectedDate } = useCalendarViewStore();
    const { tasks } = useTaskStore();
    const { events } = useCalendarStore();
    const { activeTask, elapsedMinutes } = useActiveTaskGrowth();

    // Filter tasks and events for selected day
    const dayTasks = useMemo(() => {
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);

        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            const taskEnd = task.end_time ? new Date(task.end_time) : taskStart;

            return (
                (taskStart >= dayStart && taskStart <= dayEnd) ||
                (taskEnd >= dayStart && taskEnd <= dayEnd) ||
                (taskStart <= dayStart && taskEnd >= dayEnd)
            );
        });
    }, [tasks, selectedDate]);

    const dayEvents = useMemo(() => {
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);

        return events.filter((event) => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);

            return (
                (eventStart >= dayStart && eventStart <= dayEnd) ||
                (eventEnd >= dayStart && eventEnd <= dayEnd) ||
                (eventStart <= dayStart && eventEnd >= dayEnd)
            );
        });
    }, [events, selectedDate]);

    // Current time indicator position
    const currentTimePosition = useMemo(() => {
        const now = new Date();
        if (now.toDateString() !== selectedDate.toDateString()) {
            return null; // Don't show indicator for other days
        }
        const hours = now.getHours();
        const minutes = now.getMinutes();
        return hours * 60 + minutes;
    }, [selectedDate]);

    // Hour labels (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex">
                {/* Hour labels */}
                <div className="w-20 flex-shrink-0 border-r border-border">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-16 border-b border-border flex items-start justify-end pr-2 pt-1 text-sm text-muted-foreground"
                        >
                            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="flex-1 relative">
                    {/* Hour rows */}
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-16 border-b border-border hover:bg-muted/50 transition-colors"
                        />
                    ))}

                    {/* Current time indicator */}
                    {currentTimePosition !== null && (
                        <div
                            className="absolute left-0 right-0 z-10 flex items-center"
                            style={{
                                top: `${(currentTimePosition / 60) * 64}px`, // 64px = h-16
                            }}
                        >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="flex-1 h-0.5 bg-primary" />
                        </div>
                    )}

                    {/* Task blocks */}
                    {dayTasks.map((task) => {
                        const isActive = activeTask?.id === task.id;
                        return (
                            <TaskBlock
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                isActive={isActive}
                                liveElapsedMinutes={isActive ? elapsedMinutes : undefined}
                            />
                        );
                    })}

                    {/* Google Calendar event blocks */}
                    {dayEvents.map((event) => (
                        <GoogleEventBlock key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}
