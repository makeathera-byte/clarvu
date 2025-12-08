// Date utility functions for DayFlow

/**
 * Get today's date range (start of day to start of tomorrow)
 */
export function getTodayRange(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
}

/**
 * Get yesterday's date range
 */
export function getYesterdayRange(): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    return { start, end };
}

/**
 * Format time from ISO string to 12-hour format
 */
export function formatTime(isoString: string | null | undefined): string {
    if (!isoString) return '--:--';

    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format time from ISO string to 24-hour format
 */
export function formatTime24(isoString: string | null | undefined): string {
    if (!isoString) return '--:--';

    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return '0m';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate duration between two ISO timestamps in minutes
 */
export function calculateDurationMinutes(
    startTime: string | null | undefined,
    endTime: string | null | undefined
): number {
    if (!startTime) return 0;

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    return Math.round((end.getTime() - start.getTime()) / 60000);
}

/**
 * Get a friendly greeting based on time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

/**
 * Format today's date as a friendly string
 */
export function getTodayString(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}
