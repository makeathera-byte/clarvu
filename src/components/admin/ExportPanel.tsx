'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    FileDown,
    FileText,
    FileJson,
    Users,
    BarChart3,
    ScrollText,
    Download,
    CheckCircle,
    Calendar,
} from 'lucide-react';
import {
    adminExportUsersCSV,
    adminExportUserUsageCSV,
    adminExportSystemStatsJSON,
    adminExportLogsCSV,
} from '@/app/ppadminpp/actions';
import { downloadTextFile } from '@/lib/export';

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export function ExportPanel() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [exportStatus, setExportStatus] = useState<Record<string, ExportStatus>>({});
    const [dateRange, setDateRange] = useState('7d');

    const setStatus = (key: string, status: ExportStatus) => {
        setExportStatus((prev) => ({ ...prev, [key]: status }));
        if (status === 'success') {
            setTimeout(() => setExportStatus((prev) => ({ ...prev, [key]: 'idle' })), 2000);
        }
    };

    const handleExport = (key: string, exportFn: () => Promise<{ csv?: string; json?: string; filename?: string; error?: string }>, isJson = false) => {
        setStatus(key, 'loading');
        startTransition(async () => {
            const result = await exportFn();
            if (result.csv || result.json) {
                const content = result.csv || result.json || '';
                downloadTextFile(result.filename || `export.${isJson ? 'json' : 'csv'}`, content, isJson ? 'application/json' : 'text/csv');
                setStatus(key, 'success');
            } else {
                setStatus(key, 'error');
            }
        });
    };

    const ExportButton = ({
        label,
        description,
        icon: Icon,
        onClick,
        statusKey,
    }: {
        label: string;
        description: string;
        icon: React.ElementType;
        onClick: () => void;
        statusKey: string;
    }) => {
        const status = exportStatus[statusKey] || 'idle';
        return (
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClick}
                disabled={isPending}
                className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all"
                style={{
                    backgroundColor: status === 'success' ? '#22c55e15' : currentTheme.colors.muted,
                    border: `1px solid ${status === 'success' ? '#22c55e' : currentTheme.colors.border}`,
                }}
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                >
                    {status === 'loading' ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: currentTheme.colors.primary }} />
                    ) : status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <Icon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-medium" style={{ color: currentTheme.colors.foreground }}>{label}</p>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{description}</p>
                </div>
                <Download className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
            </motion.button>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentTheme.colors.primary}20` }}
                >
                    <FileDown className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Platform Exports
                    </h2>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Export platform-wide data
                    </p>
                </div>
            </div>

            {/* User Exports */}
            <div
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
            >
                <h3 className="font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                    User Data
                </h3>
                <div className="space-y-3">
                    <ExportButton
                        label="All Users (CSV)"
                        description="ID, email, name, created_at, last_login, status"
                        icon={Users}
                        onClick={() => handleExport('users', adminExportUsersCSV)}
                        statusKey="users"
                    />
                    <ExportButton
                        label="User Usage Stats (CSV)"
                        description="User activity, tasks, and time spent"
                        icon={BarChart3}
                        onClick={() => handleExport('usage', adminExportUserUsageCSV)}
                        statusKey="usage"
                    />
                </div>
            </div>

            {/* System Exports */}
            <div
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
            >
                <h3 className="font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                    System Data
                </h3>
                <div className="space-y-3">
                    <ExportButton
                        label="System Stats (JSON)"
                        description="Platform metrics and statistics"
                        icon={FileJson}
                        onClick={() => handleExport('stats', adminExportSystemStatsJSON, true)}
                        statusKey="stats"
                    />
                    <ExportButton
                        label="System Logs (CSV)"
                        description="Last 10,000 log entries"
                        icon={ScrollText}
                        onClick={() => handleExport('logs', () => adminExportLogsCSV(dateRange))}
                        statusKey="logs"
                    />
                </div>
            </div>

            {/* Filtered Export */}
            <div
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
            >
                <h3 className="font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                    Export by Date Range
                </h3>
                <div className="flex gap-2 mb-4">
                    {['7d', '30d', '90d', 'all'].map((range) => (
                        <motion.button
                            key={range}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDateRange(range)}
                            className="px-4 py-2 rounded-xl text-sm font-medium"
                            style={{
                                backgroundColor: dateRange === range ? currentTheme.colors.primary : currentTheme.colors.muted,
                                color: dateRange === range ? '#fff' : currentTheme.colors.foreground,
                            }}
                        >
                            {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' days')}`}
                        </motion.button>
                    ))}
                </div>
                <ExportButton
                    label="Export Logs for Range"
                    description={`Export logs from ${dateRange === 'all' ? 'all time' : `last ${dateRange.replace('d', ' days')}`}`}
                    icon={Calendar}
                    onClick={() => handleExport('logs_range', () => adminExportLogsCSV(dateRange))}
                    statusKey="logs_range"
                />
            </div>
        </div>
    );
}
