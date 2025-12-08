'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getUserDetails } from '@/app/ppadminpp/actions';
import {
    X,
    User,
    Calendar,
    CheckCircle,
    Clock,
    ListTodo,
    AlertCircle,
    Play,
} from 'lucide-react';

interface UserDetails {
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
    last_login: string | null;
    is_admin: boolean;
    disabled: boolean;
    taskSummary: {
        total: number;
        completed: number;
        inProgress: number;
        scheduled: number;
    };
    calendarConnected: boolean;
    recentTasks: Array<{
        id: string;
        title: string;
        status: string;
        created_at: string;
    }>;
}

interface UserDrawerProps {
    userId: string | null;
    onClose: () => void;
}

export function UserDrawer({ userId, onClose }: UserDrawerProps) {
    const { currentTheme } = useTheme();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
        if (userId) {
            startTransition(async () => {
                const result = await getUserDetails(userId);
                if (result.user) {
                    setUser(result.user);
                }
            });
        } else {
            setUser(null);
        }
    }, [userId]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-3 h-3 text-green-500" />;
            case 'in_progress':
                return <Play className="w-3 h-3 text-blue-500" />;
            default:
                return <Clock className="w-3 h-3 text-yellow-500" />;
        }
    };

    return (
        <AnimatePresence>
            {userId && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md z-50 overflow-y-auto"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            borderLeft: `1px solid ${currentTheme.colors.border}`,
                        }}
                    >
                        {/* Header */}
                        <div
                            className="sticky top-0 flex items-center justify-between p-4 border-b z-10"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                User Details
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-20 rounded-xl skeleton"
                                        />
                                    ))}
                                </div>
                            ) : user ? (
                                <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                            style={{
                                                backgroundColor: user.is_admin ? '#ef4444' : currentTheme.colors.primary,
                                                color: '#fff',
                                            }}
                                        >
                                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p
                                                className="text-xl font-semibold"
                                                style={{ color: currentTheme.colors.foreground }}
                                            >
                                                {user.full_name || 'Unknown User'}
                                            </p>
                                            {user.is_admin && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
                                                    Admin
                                                </span>
                                            )}
                                            {user.disabled && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 ml-2">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div
                                        className="p-4 rounded-xl space-y-3"
                                        style={{ backgroundColor: currentTheme.colors.muted }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-sm"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                Joined
                                            </span>
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: currentTheme.colors.foreground }}
                                            >
                                                {formatDate(user.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-sm"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                Last Login
                                            </span>
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: currentTheme.colors.foreground }}
                                            >
                                                {formatDate(user.last_login)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-sm flex items-center gap-2"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Calendar
                                            </span>
                                            <span
                                                className={`text-sm font-medium ${user.calendarConnected ? 'text-green-500' : 'text-gray-500'
                                                    }`}
                                            >
                                                {user.calendarConnected ? 'Connected' : 'Not Connected'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Task Summary */}
                                    <div>
                                        <h4
                                            className="text-sm font-semibold mb-3 flex items-center gap-2"
                                            style={{ color: currentTheme.colors.foreground }}
                                        >
                                            <ListTodo className="w-4 h-4" />
                                            Task Summary
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                className="p-3 rounded-xl text-center"
                                                style={{ backgroundColor: currentTheme.colors.muted }}
                                            >
                                                <p
                                                    className="text-2xl font-bold"
                                                    style={{ color: currentTheme.colors.foreground }}
                                                >
                                                    {user.taskSummary.total}
                                                </p>
                                                <p
                                                    className="text-xs"
                                                    style={{ color: currentTheme.colors.mutedForeground }}
                                                >
                                                    Total
                                                </p>
                                            </div>
                                            <div
                                                className="p-3 rounded-xl text-center"
                                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                                            >
                                                <p className="text-2xl font-bold text-green-500">
                                                    {user.taskSummary.completed}
                                                </p>
                                                <p className="text-xs text-green-500/70">
                                                    Completed
                                                </p>
                                            </div>
                                            <div
                                                className="p-3 rounded-xl text-center"
                                                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                            >
                                                <p className="text-2xl font-bold text-blue-500">
                                                    {user.taskSummary.inProgress}
                                                </p>
                                                <p className="text-xs text-blue-500/70">
                                                    In Progress
                                                </p>
                                            </div>
                                            <div
                                                className="p-3 rounded-xl text-center"
                                                style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)' }}
                                            >
                                                <p className="text-2xl font-bold text-yellow-500">
                                                    {user.taskSummary.scheduled}
                                                </p>
                                                <p className="text-xs text-yellow-500/70">
                                                    Scheduled
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Tasks */}
                                    <div>
                                        <h4
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: currentTheme.colors.foreground }}
                                        >
                                            Recent Tasks
                                        </h4>
                                        <div className="space-y-2">
                                            {user.recentTasks.length > 0 ? (
                                                user.recentTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="p-3 rounded-xl flex items-center gap-3"
                                                        style={{ backgroundColor: currentTheme.colors.muted }}
                                                    >
                                                        {getStatusIcon(task.status)}
                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className="text-sm font-medium truncate"
                                                                style={{ color: currentTheme.colors.foreground }}
                                                            >
                                                                {task.title}
                                                            </p>
                                                            <p
                                                                className="text-xs"
                                                                style={{ color: currentTheme.colors.mutedForeground }}
                                                            >
                                                                {formatDate(task.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p
                                                    className="text-sm p-4 text-center"
                                                    style={{ color: currentTheme.colors.mutedForeground }}
                                                >
                                                    No tasks yet
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <AlertCircle
                                        className="w-8 h-8"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
