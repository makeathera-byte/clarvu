'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getSystemLogs } from '@/app/ppadminpp/actions';
import {
    FileText,
    AlertCircle,
    AlertTriangle,
    Info,
    RefreshCw,
    Filter,
} from 'lucide-react';

interface LogEntry {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    meta: Record<string, unknown> | null;
    created_at: string;
}

export function LogsViewer() {
    const { currentTheme } = useTheme();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [isPending, startTransition] = useTransition();

    const loadLogs = useCallback(() => {
        startTransition(async () => {
            const result = await getSystemLogs();
            if (result.logs) {
                const mappedLogs = result.logs.map((log) => ({
                    id: String(log.id),
                    level: (log.log_type || 'info') as 'info' | 'warn' | 'error',
                    message: log.message,
                    meta: log.metadata as Record<string, unknown> | null,
                    created_at: log.created_at,
                }));
                setLogs(mappedLogs);
            }
        });
    }, []);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => log.level === filter);

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warn':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'warn':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border backdrop-blur-sm overflow-hidden"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: currentTheme.colors.border }}
            >
                <h3
                    className="text-lg font-semibold flex items-center gap-2"
                    style={{ color: currentTheme.colors.foreground }}
                >
                    <FileText className="w-5 h-5" />
                    System Logs
                </h3>

                <div className="flex items-center gap-2">
                    {/* Filter */}
                    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: currentTheme.colors.muted }}>
                        <Filter className="w-3 h-3 ml-2" style={{ color: currentTheme.colors.mutedForeground }} />
                        {['all', 'info', 'warn', 'error'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilter(level)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === level ? 'bg-white/10' : ''
                                    }`}
                                style={{
                                    color: filter === level
                                        ? currentTheme.colors.foreground
                                        : currentTheme.colors.mutedForeground,
                                }}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={loadLogs}
                        disabled={isPending}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                    <thead className="sticky top-0" style={{ backgroundColor: currentTheme.colors.muted }}>
                        <tr>
                            <th
                                className="text-left text-xs font-medium px-4 py-2"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Time
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-2"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Level
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-2"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Message
                            </th>
                            <th
                                className="text-left text-xs font-medium px-4 py-2 hidden lg:table-cell"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Metadata
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.01 }}
                                    className="border-b transition-colors hover:bg-white/5"
                                    style={{ borderColor: currentTheme.colors.border }}
                                >
                                    <td
                                        className="px-4 py-3 text-xs whitespace-nowrap"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getLevelColor(log.level)}`}>
                                            {getLevelIcon(log.level)}
                                            {log.level}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-3 text-sm max-w-md truncate"
                                        style={{ color: currentTheme.colors.foreground }}
                                    >
                                        {log.message}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-xs hidden lg:table-cell"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        {log.meta ? (
                                            <code className="px-2 py-1 rounded bg-black/20 text-xs">
                                                {JSON.stringify(log.meta).slice(0, 50)}...
                                            </code>
                                        ) : '-'}
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-sm"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    {isPending ? 'Loading logs...' : 'No logs found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div
                className="px-4 py-2 border-t text-xs"
                style={{
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.mutedForeground,
                }}
            >
                Showing {filteredLogs.length} of {logs.length} logs
            </div>
        </motion.div>
    );
}
