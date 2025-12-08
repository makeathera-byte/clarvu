'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Bell } from 'lucide-react';
import { NotificationsList } from '@/components/notifications';

export default function NotificationsPage() {
    const { currentTheme } = useTheme();

    return (
        <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                        >
                            <Bell className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                            Notifications
                        </h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Stay updated with your activity
                    </p>
                </motion.div>

                {/* Notifications List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <NotificationsList />
                </motion.div>
            </div>
        </main>
    );
}
