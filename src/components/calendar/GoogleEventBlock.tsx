'use client';

import { useMemo } from 'react';

interface GoogleEventBlockProps {
    event: any;
    isCompact?: boolean;
}

export function GoogleEventBlock({ event, isCompact }: GoogleEventBlockProps) {
    // Calculate position and height from event times
    const { top, height } = useMemo(() => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);

        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
        const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
        const durationMinutes = endMinutes - startMinutes;

        // Convert to pixels (each hour = 64px for day view, 48px for week view)
        const pixelsPerHour = isCompact ? 48 : 64;
        const pixelsPerMinute = pixelsPerHour / 60;

        return {
            top: startMinutes * pixelsPerMinute,
            height: Math.max(durationMinutes * pixelsPerMinute, isCompact ? 24 : 32),
        };
    }, [event, isCompact]);

    return (
        <div
            className="absolute left-1 right-1 rounded-md px-2 py-1 border-2 border-blue-300 bg-blue-50/30 backdrop-blur-sm"
            style={{
                top: `${top}px`,
                height: `${height}px`,
            }}
            title={`${event.title} (Google Calendar)`}
        >
            <div className="text-blue-700 text-xs font-medium truncate flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span className="truncate">{event.title}</span>
            </div>
            {!isCompact && height > 40 && event.description && (
                <div className="text-blue-600/70 text-[10px] truncate mt-0.5">
                    {event.description}
                </div>
            )}
        </div>
    );
}
