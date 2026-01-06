'use client';

import { useMemo } from 'react';
import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { TaskBlock } from './TaskBlock';
import { GoogleEventBlock } from './GoogleEventBlock';
import { useActiveTaskGrowth } from '@/lib/hooks/useActiveTaskGrowth';

interface WeekViewProps {
    onEditTask: (task: any) => void;
}

export function WeekView({ onEditTask }: WeekViewProps) {
    const { selectedDate } = useCalendarViewStore();
    const { tasks } = useTaskStore();
    const { events } = useCalendarStore();
    const { activeTask, elapsedMinutes } = useActiveTaskGrowth();

    // Get week start (Sunday) and generate 7 days
    const weekDays = useMemo(() => {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            return day;
        });
    }, [selectedDate]);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Filter tasks and events by day
    const getTasksForDay = (day: Date) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        return tasks.filter((task) => {
            if (!task.start_time) return false;
            const taskStart = new Date(task.start_time);
            return taskStart >= dayStart && taskStart <= dayEnd;
        });
    };

    const getEventsForDay = (day: Date) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        return events.filter((event) => {
            const eventStart = new Date(event.start_time);
            return eventStart >= dayStart && eventStart <= dayEnd;
        });
    };

    return (
        <div className="bg-card rounded-lg border border-border overflow-x-auto">
            <div className="flex min-w-[800px]">
                {/* Hour labels */}
                <div className="w-16 flex-shrink-0 border-r border-border">
                    <div className="h-12 border-b border-border" /> {/* Header spacer */}
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-12 border-b border-border flex items-start justify-end pr-2 pt-1 text-xs text-muted-foreground"
                        >
                            {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
                        </div>
                    ))}
                </div>

                {/* Days columns */}
                {weekDays.map((day, dayIndex) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayTasks = getTasksForDay(day);
                    const dayEvents = getEventsForDay(day);

                    return (
                        <div key={dayIndex} className="flex-1 border-r border-border last:border-r-0">
                            {/* Day header */}
                            <div className={`h-12 border-b border-border flex flex-col items-center justify-center ${isToday ? 'bg-primary/10' : ''}`}>
                                <div className="text-xs text-muted-foreground">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                                    {day.getDate()}
                                </div>
                            </div>

                            {/* Hour rows */}
                            <div className="relative">
                                {hours.map((hour) => (
                                    <div
                                        key={hour}
                                        className="h-12 border-b border-border hover:bg-muted/50 transition-colors"
                                    />
                                ))}

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
                                            isCompact
                                        />
                                    );
                                })}

                                {/* Google events */}
                                {dayEvents.map((event) => (
                                    <GoogleEventBlock key={event.id} event={event} isCompact />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
