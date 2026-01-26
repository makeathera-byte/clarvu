'use client';

import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { YearView } from './YearView';

interface ViewRendererProps {
    onEditTask: (task: any) => void;
    onDateClick?: (date: Date) => void;
}

export function ViewRenderer({ onEditTask, onDateClick }: ViewRendererProps) {
    const { view } = useCalendarViewStore();

    switch (view) {
        case 'day':
            return <DayView onEditTask={onEditTask} onDateClick={onDateClick} />;
        case 'week':
            return <WeekView onEditTask={onEditTask} onDateClick={onDateClick} />;
        case 'month':
            return <MonthView onEditTask={onEditTask} onDateClick={onDateClick} />;
        case 'year':
            return <YearView onEditTask={onEditTask} onDateClick={onDateClick} />;
        default:
            return <DayView onEditTask={onEditTask} onDateClick={onDateClick} />;
    }
}

