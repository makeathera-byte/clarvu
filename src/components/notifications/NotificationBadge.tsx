'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '@/app/notifications/actions';
import { NotificationPanel } from './NotificationPanel';
import { supabase } from '@/lib/supabase/client';

export function NotificationBadge() {
    const { currentTheme } = useTheme();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);

    const loadCount = async () => {
        const result = await getUnreadCount();
        setUnreadCount(result.count);
    };

    useEffect(() => {
        loadCount();

        // Set up realtime subscription

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                () => {
                    // New notification received
                    setHasNewNotification(true);
                    loadCount();

                    // Reset ping animation after 3 seconds
                    setTimeout(() => setHasNewNotification(false), 3000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Refresh count when panel closes
    useEffect(() => {
        if (!isPanelOpen) {
            loadCount();
        }
    }, [isPanelOpen]);

    const displayCount = unreadCount > 9 ? '9+' : unreadCount;

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPanelOpen(true)}
                className="relative p-2 rounded-xl transition-colors"
                style={{
                    backgroundColor: isPanelOpen
                        ? `${currentTheme.colors.primary}20`
                        : 'transparent',
                }}
            >
                <Bell
                    className="w-5 h-5"
                    style={{ color: currentTheme.colors.foreground }}
                />

                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: '#fff',
                            }}
                        >
                            {displayCount}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ping animation for new notifications */}
                <AnimatePresence>
                    {hasNewNotification && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 rounded-xl"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            <NotificationPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />
        </>
    );
}
