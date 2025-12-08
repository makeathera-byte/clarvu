'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatTime } from '@/lib/utils/date';
import { Calendar, ExternalLink } from 'lucide-react';

interface CalendarEvent {
    id: string;
    external_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
}

interface TodayEventsProps {
    events: CalendarEvent[];
}

export function TodayEvents({ events }: TodayEventsProps) {
    const { currentTheme } = useTheme();

    if (events.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="p-6 rounded-2xl border backdrop-blur-sm"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <Calendar className="w-5 h-5" style={{ color: '#4285F4' }} />
                    Google Calendar Events
                </h3>

                <div className="text-center py-8">
                    <Calendar
                        className="w-12 h-12 mx-auto mb-3"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No events scheduled for today
                    </p>
                    <p
                        className="text-sm mt-1"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Connect Google Calendar in Settings
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <Calendar className="w-5 h-5" style={{ color: '#4285F4' }} />
                    Google Calendar Events
                </h3>

                {/* Google Calendar badge */}
                <span
                    className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    style={{
                        backgroundColor: '#4285F415',
                        color: '#4285F4',
                    }}
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fillOpacity="0.2" />
                        <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                    Synced
                </span>
            </div>

            {/* Events list */}
            <div className="space-y-3">
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                        className="p-4 rounded-xl border"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            borderColor: currentTheme.colors.border,
                        }}
                    >
                        {/* Time range */}
                        <div
                            className="flex items-center gap-2 mb-2"
                            style={{ color: '#4285F4' }}
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {formatTime(event.start_time)} → {formatTime(event.end_time)}
                            </span>
                        </div>

                        {/* Title */}
                        <h4
                            className="font-medium"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {event.title}
                        </h4>

                        {/* Description */}
                        {event.description && (
                            <p
                                className="text-sm mt-1 line-clamp-2"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                {event.description}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* View in Google Calendar link */}
            <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                    color: currentTheme.colors.mutedForeground,
                    backgroundColor: 'transparent',
                }}
            >
                <ExternalLink className="w-4 h-4" />
                Open Google Calendar
            </a>
        </motion.div>
    );
}
