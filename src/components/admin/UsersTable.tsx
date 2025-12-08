'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { revokeUser, restoreUser } from '@/app/ppadminpp/actions';
import { User, Ban, CheckCircle, Clock, ListTodo, ChevronRight } from 'lucide-react';

interface UserRow {
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
    last_login: string | null;
    is_admin: boolean;
    disabled: boolean;
    task_count: number;
    total_minutes: number;
}

interface UsersTableProps {
    users: UserRow[];
    onSelectUser: (userId: string) => void;
}

export function UsersTable({ users, onSelectUser }: UsersTableProps) {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [actionUserId, setActionUserId] = useState<string | null>(null);

    const handleRevoke = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActionUserId(userId);
        startTransition(async () => {
            await revokeUser(userId);
            setActionUserId(null);
        });
    };

    const handleRestore = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActionUserId(userId);
        startTransition(async () => {
            await restoreUser(userId);
            setActionUserId(null);
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatMinutes = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border backdrop-blur-sm overflow-hidden"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.border }}>
                <h3
                    className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <User className="w-5 h-5" />
                    Users ({users.length})
                </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: currentTheme.colors.muted }}>
                            <th
                                className="text-left text-xs font-medium px-4 py-3"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                User
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3 hidden md:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Joined
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3 hidden lg:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Last Login
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3 hidden sm:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Tasks
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3 hidden md:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Time Logged
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Status
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-3"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.02 }}
                                onClick={() => onSelectUser(user.id)}
                                className="cursor-pointer transition-colors"
                                style={{
                                    borderBottom: `1px solid ${currentTheme.colors.border}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${currentTheme.colors.muted}50`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{
                                                backgroundColor: user.is_admin ? '#ef4444' : currentTheme.colors.primary,
                                                color: '#fff',
                                            }}
                                        >
                                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p
                                                className="font-medium text-sm"
                                                style={{ color: currentTheme.colors.foreground }}
                                            >
                                                {user.full_name || 'Unknown'}
                                                {user.is_admin && (
                                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
                                                        Admin
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-4 py-3 text-sm hidden md:table-cell"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {formatDate(user.created_at)}
                                </td>
                                <td
                                    className="px-4 py-3 text-sm hidden lg:table-cell"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(user.last_login)}
                                    </span>
                                </td>
                                <td
                                    className="px-4 py-3 text-sm hidden sm:table-cell"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    <span className="flex items-center gap-1">
                                        <ListTodo className="w-3 h-3" />
                                        {user.task_count}
                                    </span>
                                </td>
                                <td
                                    className="px-4 py-3 text-sm hidden md:table-cell"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {formatMinutes(user.total_minutes)}
                                </td>
                                <td className="px-4 py-3">
                                    {user.disabled ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                                            <Ban className="w-3 h-3" />
                                            Disabled
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                                            <CheckCircle className="w-3 h-3" />
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {user.disabled ? (
                                            <button
                                                onClick={(e) => handleRestore(user.id, e)}
                                                disabled={isPending && actionUserId === user.id}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                                            >
                                                {isPending && actionUserId === user.id ? '...' : 'Restore'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleRevoke(user.id, e)}
                                                disabled={isPending && actionUserId === user.id || user.is_admin}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                            >
                                                {isPending && actionUserId === user.id ? '...' : 'Revoke'}
                                            </button>
                                        )}
                                        <ChevronRight
                                            className="w-4 h-4"
                                            style={{ color: currentTheme.colors.mutedForeground }}
                                        />
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="p-8 text-center" style={{ color: currentTheme.colors.mutedForeground }}>
                    No users found
                </div>
            )}
        </motion.div>
    );
}
