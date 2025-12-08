// Date utility functions for Clarvu

/**
 * Get today's date range (start of day to start of tomorrow) in a specific timezone
 * @param timezone - IANA timezone string (e.g., 'America/New_York'). Defaults to UTC if not provided.
 */
export function getTodayRange(timezone?: string): { start: Date; end: Date } {
    if (!timezone) {
        // Fallback to UTC if no timezone provided
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        return { start, end };
    }

    // Get current time in the specified timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    // Get today's date in the timezone
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // Month is 0-indexed
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');

    // Create start of day string in the timezone
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    
    // Create a date object representing midnight in the user's timezone
    // We need to interpret this date string as if it's in the user's timezone
    const tempDate = new Date(dateStr);
    
    // Get what this date would be in UTC
    const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const localDate = new Date(tempDate.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcDate.getTime() - localDate.getTime();
    
    // Create start of day in UTC
    const start = new Date(tempDate.getTime() - offset);
    
    // Create end of day (start of tomorrow) - add 24 hours
    const end = new Date(start);
    end.setUTCHours(end.getUTCHours() + 24);

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
 * @param isoString - ISO timestamp string
 * @param timezone - IANA timezone string (e.g., 'America/New_York'). Uses browser timezone if not provided.
 */
export function formatTime(isoString: string | null | undefined, timezone?: string): string {
    if (!isoString) return '--:--';

    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    
    if (timezone) {
        options.timeZone = timezone;
    }
    
    return date.toLocaleTimeString('en-US', options);
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
