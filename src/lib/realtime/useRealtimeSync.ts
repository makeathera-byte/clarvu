'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getRealtimeClient, CHANNELS, TABLES } from './client';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { useCalendarStore } from '@/lib/store/useCalendarStore';
import { useTimerStore } from '@/lib/store/useTimerStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSyncOptions {
    userId: string;
    onConnectionChange?: (status: 'connected' | 'reconnecting' | 'disconnected') => void;
}

export function useRealtimeSync({ userId, onConnectionChange }: UseRealtimeSyncOptions) {
    const channelsRef = useRef<RealtimeChannel[]>([]);
    const isSubscribedRef = useRef(false);

    // Get stable references to store methods using shallow selectors
    const addOrUpdateTask = useTaskStore((s) => s.addOrUpdate);
    const removeTask = useTaskStore((s) => s.remove);
    const addOrUpdateNotification = useNotificationStore((s) => s.addOrUpdate);
    const removeNotification = useNotificationStore((s) => s.remove);
    const addOrUpdateCalendar = useCalendarStore((s) => s.addOrUpdate);
    const removeCalendar = useCalendarStore((s) => s.remove);
    const addOrUpdateTimer = useTimerStore((s) => s.addOrUpdate);
    const removeTimer = useTimerStore((s) => s.remove);

    const setupSubscriptions = useCallback(() => {
        if (!userId || isSubscribedRef.current) return;

        console.log('[Realtime] Setting up subscriptions for user:', userId);
        const client = getRealtimeClient();
        isSubscribedRef.current = true;

        // Tasks channel
        const tasksChannel = client
            .channel(CHANNELS.TASKS)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.TASKS,
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[Realtime] Task change:', payload.eventType, payload);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        addOrUpdateTask(payload.new as any);
                    } else if (payload.eventType === 'DELETE') {
                        removeTask((payload.old as { id: string }).id);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Tasks channel status:', status);
                if (status === 'SUBSCRIBED') {
                    onConnectionChange?.('connected');
                } else if (status === 'CHANNEL_ERROR') {
                    onConnectionChange?.('disconnected');
                }
            });

        // Notifications channel
        const notificationsChannel = client
            .channel(CHANNELS.NOTIFICATIONS)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.NOTIFICATIONS,
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[Realtime] Notification change:', payload.eventType);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        addOrUpdateNotification(payload.new as any);
                    } else if (payload.eventType === 'DELETE') {
                        removeNotification((payload.old as { id: string }).id);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Notifications channel status:', status);
            });

        // Calendar events channel
        const calendarChannel = client
            .channel(CHANNELS.CALENDAR)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.CALENDAR_EVENTS,
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[Realtime] Calendar change:', payload.eventType);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        addOrUpdateCalendar(payload.new as any);
                    } else if (payload.eventType === 'DELETE') {
                        removeCalendar((payload.old as { id: string }).id);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Calendar channel status:', status);
            });

        // Active timers channel
        const timersChannel = client
            .channel(CHANNELS.TIMERS)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.ACTIVE_TIMERS,
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('[Realtime] Timer change:', payload.eventType);
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        addOrUpdateTimer(payload.new as any);
                    } else if (payload.eventType === 'DELETE') {
                        removeTimer((payload.old as { id: string }).id);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Timers channel status:', status);
            });

        // Store channel references for cleanup
        channelsRef.current = [tasksChannel, notificationsChannel, calendarChannel, timersChannel];

        return () => {
            console.log('[Realtime] Cleaning up subscriptions');
            isSubscribedRef.current = false;
            channelsRef.current.forEach((channel) => {
                client.removeChannel(channel);
            });
            channelsRef.current = [];
        };
    }, [
        userId,
        addOrUpdateTask,
        removeTask,
        addOrUpdateNotification,
        removeNotification,
        addOrUpdateCalendar,
        removeCalendar,
        addOrUpdateTimer,
        removeTimer,
        onConnectionChange,
    ]);

    useEffect(() => {
        const cleanup = setupSubscriptions();
        return cleanup;
    }, [setupSubscriptions]);
}
