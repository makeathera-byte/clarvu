'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    Bell,
    Sparkles,
    AlarmClock,
    Megaphone,
    Plug,
    CheckCircle,
    CalendarCheck,
    Settings,
    Trash2,
} from 'lucide-react';
import { markNotificationRead, deleteNotification } from '@/app/notifications/actions';
import { useTransition } from 'react';

const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
    reminder: { icon: AlarmClock, color: '#f59e0b' },
    task: { icon: CheckCircle, color: '#22c55e' },
    ai_summary: { icon: Sparkles, color: '#8b5cf6' },
    calendar: { icon: CalendarCheck, color: '#3b82f6' },
    integration: { icon: Plug, color: '#14b8a6' },
    admin: { icon: Megaphone, color: '#ef4444' },
    system: { icon: Settings, color: '#6b7280' },
    default: { icon: Bell, color: '#6b7280' },
};

function formatTimeAgo(date: string) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

interface NotificationItemProps {
    id: string;
    title: string;
    body?: string;
    category: string;
    read: boolean;
    created_at: string;
    onUpdate?: () => void;
}

export function NotificationItem({
    id,
    title,
    body,
    category,
    read,
    created_at,
    onUpdate,
}: NotificationItemProps) {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();

    const config = categoryConfig[category] || categoryConfig.default;
    const Icon = config.icon;

    const handleMarkRead = () => {
        if (read) return;
        startTransition(async () => {
            await markNotificationRead(id);
            onUpdate?.();
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        startTransition(async () => {
            await deleteNotification(id);
            onUpdate?.();
        });
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={handleMarkRead}
            className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${!read ? 'shadow-lg' : ''
                }`}
            style={{
                backgroundColor: !read
                    ? `${config.color}08`
                    : currentTheme.colors.card,
                borderColor: !read
                    ? `${config.color}30`
                    : currentTheme.colors.border,
                opacity: isPending ? 0.6 : 1,
            }}
        >
            {/* Unread indicator */}
            {!read && (
                <div
                    className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: config.color }}
                />
            )}

            <div className="flex gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4
                            className={`font-medium ${!read ? 'font-semibold' : ''}`}
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {title}
                        </h4>
                        <span
                            className="text-xs flex-shrink-0"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {formatTimeAgo(created_at)}
                        </span>
                    </div>
                    {body && (
                        <p
                            className="text-sm mt-1 line-clamp-2"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            {body}
                        </p>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-opacity"
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </motion.button>
            </div>
        </motion.div>
    );
}
