// Notification scheduler utilities
// For use with Supabase Edge Functions or Vercel Cron Jobs

import { sendNotificationToUser } from '@/app/notifications/actions';

export interface ScheduledNotification {
    userId: string;
    title: string;
    body: string;
    category: string;
    scheduledFor: Date;
}

// Generate daily AI summary notification (to be called by cron)
export async function generateDailySummaryNotifications(
    users: Array<{ id: string; ai_summary_time?: string }>
): Promise<number> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    let sent = 0;

    for (const user of users) {
        // Check if user's summary time matches current time (within 5 min window)
        const userTime = user.ai_summary_time || '09:00';

        if (isWithinTimeWindow(currentTime, userTime, 5)) {
            await sendNotificationToUser(user.id, {
                title: 'Your AI Summary is Ready',
                body: 'Check out your personalized productivity insights for today.',
                category: 'ai_summary',
            });
            sent++;
        }
    }

    return sent;
}

// Generate task reminder notifications
export async function generateTaskReminders(
    tasks: Array<{
        userId: string;
        taskName: string;
        scheduledFor: Date;
    }>
): Promise<number> {
    const now = new Date();
    let sent = 0;

    for (const task of tasks) {
        const timeDiff = task.scheduledFor.getTime() - now.getTime();
        const minutesUntil = Math.floor(timeDiff / 60000);

        // Send reminder 15 minutes before
        if (minutesUntil >= 14 && minutesUntil <= 16) {
            await sendNotificationToUser(task.userId, {
                title: `Upcoming: ${task.taskName}`,
                body: `Starting in ${minutesUntil} minutes`,
                category: 'reminder',
            });
            sent++;
        }
    }

    return sent;
}

// Helper: check if current time is within window of target time
function isWithinTimeWindow(
    current: string,
    target: string,
    windowMinutes: number
): boolean {
    const [currentH, currentM] = current.split(':').map(Number);
    const [targetH, targetM] = target.split(':').map(Number);

    const currentMinutes = currentH * 60 + currentM;
    const targetMinutes = targetH * 60 + targetM;

    return Math.abs(currentMinutes - targetMinutes) <= windowMinutes;
}

// Calendar sync error notification
export async function sendCalendarErrorNotification(
    userId: string,
    errorMessage: string
): Promise<void> {
    await sendNotificationToUser(userId, {
        title: 'Calendar Sync Error',
        body: errorMessage || 'There was an issue syncing your calendar. Please reconnect.',
        category: 'calendar',
    });
}

// Integration status notification
export async function sendIntegrationNotification(
    userId: string,
    integrationName: string,
    connected: boolean
): Promise<void> {
    await sendNotificationToUser(userId, {
        title: connected
            ? `${integrationName} Connected`
            : `${integrationName} Disconnected`,
        body: connected
            ? `Your ${integrationName} account is now connected.`
            : `Your ${integrationName} account has been disconnected.`,
        category: 'integration',
    });
}
