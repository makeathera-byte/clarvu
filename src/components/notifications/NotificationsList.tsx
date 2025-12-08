'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import {
    getNotifications,
    markAllNotificationsRead,
    deleteAllNotifications,
} from '@/app/notifications/actions';

interface Notification {
    id: string;
    title: string;
    body?: string;
    category: string;
    read: boolean;
    created_at: string;
}

export function NotificationsList() {
    const { currentTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        const result = await getNotifications();
        if (result.notifications) {
            setNotifications(result.notifications);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllNotificationsRead();
            loadNotifications();
        });
    };

    const handleDeleteAll = () => {
        startTransition(async () => {
            await deleteAllNotifications();
            loadNotifications();
        });
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        {notifications.length} notifications
                    </span>
                    {unreadCount > 0 && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: '#fff',
                            }}
                        >
                            {unreadCount} unread
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleMarkAllRead}
                            disabled={isPending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                            style={{
                                backgroundColor: currentTheme.colors.muted,
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </motion.button>
                    )}
                    {notifications.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeleteAll}
                            disabled={isPending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl skeleton" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                >
                    <Bell
                        className="w-12 h-12 mx-auto mb-4 opacity-20"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    />
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        No notifications yet
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-3">
                        {notifications.map((n, i) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: i * 0.02 }}
                            >
                                <NotificationItem
                                    {...n}
                                    onUpdate={loadNotifications}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
