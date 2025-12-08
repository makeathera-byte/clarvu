'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { X, CheckCheck, Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import {
    getNotifications,
    markAllNotificationsRead,
} from '@/app/notifications/actions';
import Link from 'next/link';

interface Notification {
    id: string;
    title: string;
    body?: string;
    category: string;
    read: boolean;
    created_at: string;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { currentTheme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPending, startTransition] = useTransition();

    const loadNotifications = async () => {
        const result = await getNotifications(20);
        if (result.notifications) {
            setNotifications(result.notifications);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllNotificationsRead();
            loadNotifications();
        });
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-hidden"
                        style={{ backgroundColor: currentTheme.colors.background }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between p-4 border-b"
                            style={{ borderColor: currentTheme.colors.border }}
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                                <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    Notifications
                                </h2>
                                {unreadCount > 0 && (
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleMarkAllRead}
                                        disabled={isPending}
                                        className="p-2 rounded-lg"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        <CheckCheck className="w-5 h-5" />
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="p-2 rounded-lg"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Bell
                                        className="w-12 h-12 mx-auto mb-4 opacity-20"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    />
                                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                                        No notifications
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            {...n}
                                            onUpdate={loadNotifications}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className="absolute bottom-0 left-0 right-0 p-4 border-t"
                            style={{
                                borderColor: currentTheme.colors.border,
                                backgroundColor: currentTheme.colors.background,
                            }}
                        >
                            <Link href="/notifications" onClick={onClose}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-2 rounded-xl text-sm font-medium"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                    }}
                                >
                                    View all notifications
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
