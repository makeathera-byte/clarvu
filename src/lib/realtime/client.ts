// Supabase Realtime client for client-side subscriptions
// Uses the same client as the rest of the app for consistency
import { supabase } from '@/lib/supabase/client';

// Get the browser client for realtime subscriptions
export function getRealtimeClient() {
    return supabase;
}

// Channel names for each entity
export const CHANNELS = {
    TASKS: 'tasks-realtime',
    TIMERS: 'timers-realtime',
    NOTIFICATIONS: 'notifications-realtime',
    CALENDAR: 'calendar-realtime',
} as const;

// Table names
export const TABLES = {
    TASKS: 'tasks',
    ACTIVE_TIMERS: 'active_timers',
    NOTIFICATIONS: 'notifications',
    CALENDAR_EVENTS: 'calendar_events',
} as const;
