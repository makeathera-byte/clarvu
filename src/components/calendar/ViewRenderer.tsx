'use client';

import { useCalendarViewStore } from '@/lib/store/useCalendarViewStore';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

interface ViewRendererProps {
    onEditTask: (task: any) => void;
}

export function ViewRenderer({ onEditTask }: ViewRendererProps) {
    const { view } = useCalendarViewStore();

    switch (view) {
        case 'day':
            return <DayView onEditTask={onEditTask} />;
        case 'week':
            return <WeekView onEditTask={onEditTask} />;
        case 'month':
            return <MonthView onEditTask={onEditTask} />;
        default:
            return <DayView onEditTask={onEditTask} />;
    }
}
