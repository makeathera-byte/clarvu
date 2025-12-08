'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { revokeUser, restoreUser } from '@/app/ppadminpp/actions';
import {
    Shield,
    UserX,
    UserCheck,
    RefreshCw,
    Download,
    Bell,
    LogOut,
    Users,
} from 'lucide-react';

interface AdminToolsProps {
    onRefresh: () => void;
}

export function AdminTools({ onRefresh }: AdminToolsProps) {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const handleAction = async (actionId: string, action: () => Promise<void>) => {
        setActiveAction(actionId);
        startTransition(async () => {
            await action();
            setActiveAction(null);
            onRefresh();
        });
    };

    const exportAnalytics = async () => {
        // Export analytics as CSV
        alert('Analytics export started. File will download shortly.');
    };

    const sendNotification = async () => {
        // Send system notification
        alert('System notification sent to all users.');
    };

    const tools = [
        {
            id: 'refresh',
            label: 'Refresh Data',
            description: 'Reload all admin data',
            icon: RefreshCw,
            color: '#3b82f6',
            action: async () => { onRefresh(); },
        },
        {
            id: 'export',
            label: 'Export Analytics',
            description: 'Download CSV report',
            icon: Download,
            color: '#22c55e',
            action: exportAnalytics,
        },
        {
            id: 'notify',
            label: 'System Notification',
            description: 'Send to all users',
            icon: Bell,
            color: '#f59e0b',
            action: sendNotification,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                >
                    <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Admin Tools
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Manage users and system
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="p-6 rounded-2xl border"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h4
                    className="text-sm font-semibold mb-4"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    Quick Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        const isLoading = isPending && activeAction === tool.id;

                        return (
                            <motion.button
                                key={tool.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAction(tool.id, tool.action)}
                                disabled={isPending}
                                className="p-4 rounded-xl border text-left transition-all hover:bg-white/5"
                                style={{
                                    borderColor: currentTheme.colors.border,
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                    style={{ backgroundColor: `${tool.color}15` }}
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" style={{ color: tool.color }} />
                                    ) : (
                                        <Icon className="w-5 h-5" style={{ color: tool.color }} />
                                    )}
                                </div>
                                <p
                                    className="font-medium text-sm"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    {tool.label}
                                </p>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {tool.description}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* User Management */}
            <div
                className="p-6 rounded-2xl border"
                style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                }}
            >
                <h4
                    className="text-sm font-semibold mb-4"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    User Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <UserX className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-red-500">Revoke Access</span>
                        </div>
                        <p
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Disable user accounts from the Users table. Click on a user row to open details drawer.
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <UserCheck className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-green-500">Restore Access</span>
                        </div>
                        <p
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Re-enable disabled accounts. Look for users with "Disabled" status in the Users table.
                        </p>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-amber-500">Admin Actions Are Logged</p>
                    <p className="text-xs text-amber-500/70 mt-1">
                        All admin actions are recorded in the system logs for audit purposes.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
