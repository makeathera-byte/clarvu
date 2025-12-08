'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    Download,
    FileText,
    FileJson,
    Calendar,
    BarChart3,
    FileDown,
    CheckCircle,
    Package,
} from 'lucide-react';
import {
    exportTasksCSV,
    exportTasksJSON,
    exportCalendarCSV,
    exportAnalyticsJSON,
    getProductivitySummary,
} from './actions';
import { downloadTextFile, downloadJSON } from '@/lib/export';

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ExportPage() {
    const { currentTheme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [exportStatus, setExportStatus] = useState<Record<string, ExportStatus>>({});

    const setStatus = (key: string, status: ExportStatus) => {
        setExportStatus((prev) => ({ ...prev, [key]: status }));
        if (status === 'success') {
            setTimeout(() => setExportStatus((prev) => ({ ...prev, [key]: 'idle' })), 2000);
        }
    };

    const handleTasksCSV = (range: 'today' | '7d' | '30d' | 'all') => {
        const key = `tasks_${range}`;
        setStatus(key, 'loading');
        startTransition(async () => {
            const result = await exportTasksCSV(range);
            if (result.csv) {
                downloadTextFile(result.filename || 'tasks.csv', result.csv);
                setStatus(key, 'success');
            } else {
                setStatus(key, 'error');
            }
        });
    };

    const handleTasksJSON = () => {
        setStatus('tasks_json', 'loading');
        startTransition(async () => {
            const result = await exportTasksJSON();
            if (result.json) {
                downloadTextFile(result.filename || 'tasks.json', result.json, 'application/json');
                setStatus('tasks_json', 'success');
            } else {
                setStatus('tasks_json', 'error');
            }
        });
    };

    const handleCalendarCSV = () => {
        setStatus('calendar', 'loading');
        startTransition(async () => {
            const result = await exportCalendarCSV();
            if (result.csv) {
                downloadTextFile(result.filename || 'calendar.csv', result.csv);
                setStatus('calendar', 'success');
            } else {
                setStatus('calendar', 'error');
            }
        });
    };

    const handleAnalyticsJSON = () => {
        setStatus('analytics', 'loading');
        startTransition(async () => {
            const result = await exportAnalyticsJSON();
            if (result.json) {
                downloadTextFile(result.filename || 'analytics.json', result.json, 'application/json');
                setStatus('analytics', 'success');
            } else {
                setStatus('analytics', 'error');
            }
        });
    };

    const handleSummaryPDF = () => {
        setStatus('summary', 'loading');
        startTransition(async () => {
            const result = await getProductivitySummary();
            if (result.summary) {
                // Generate simple text-based report (can be enhanced with jsPDF)
                const report = `
CLARVU PRODUCTIVITY SUMMARY
============================
Period: ${result.summary.period}
Generated: ${new Date(result.summary.generatedAt).toLocaleString()}

TASKS
-----
Total Tasks: ${result.summary.tasksCount}
Completed: ${result.summary.completedCount}
Completion Rate: ${result.summary.completionRate}%

FOCUS TIME
----------
Deep Work: ${result.summary.deepWorkMinutes} minutes
Breaks/Distractions: ${result.summary.distractionMinutes} minutes

TOP INSIGHTS
------------
Most Used Category: ${result.summary.topCategory}
Most Common Activity: ${result.summary.topActivity}
        `.trim();

                downloadTextFile('clarvu_summary.txt', report, 'text/plain');
                setStatus('summary', 'success');
            } else {
                setStatus('summary', 'error');
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
                    borderColor: status === 'success' ? '#22c55e' : currentTheme.colors.border,
                    border: '1px solid',
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
        <main className="pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <FileDown className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Export Data</h1>
                    </div>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Download your Clarvu data</p>
                </motion.div>

                {/* Quick Exports */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Quick Exports</h2>
                    <div className="space-y-3">
                        <ExportButton label="Today's Tasks" description="Export tasks created today as CSV" icon={FileText} onClick={() => handleTasksCSV('today')} statusKey="tasks_today" />
                        <ExportButton label="Last 7 Days Tasks" description="Export tasks from the past week" icon={FileText} onClick={() => handleTasksCSV('7d')} statusKey="tasks_7d" />
                        <ExportButton label="Last 30 Days Tasks" description="Export tasks from the past month" icon={FileText} onClick={() => handleTasksCSV('30d')} statusKey="tasks_30d" />
                    </div>
                </motion.div>

                {/* Full Data Export */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Full Data Export</h2>
                    <div className="space-y-3">
                        <ExportButton label="All Tasks (CSV)" description="Complete task history" icon={FileText} onClick={() => handleTasksCSV('all')} statusKey="tasks_all" />
                        <ExportButton label="All Tasks (JSON)" description="Full task data with all fields" icon={FileJson} onClick={handleTasksJSON} statusKey="tasks_json" />
                        <ExportButton label="Calendar Events" description="All synced calendar events" icon={Calendar} onClick={handleCalendarCSV} statusKey="calendar" />
                        <ExportButton label="Analytics Events" description="Activity and focus data" icon={BarChart3} onClick={handleAnalyticsJSON} statusKey="analytics" />
                        <ExportButton label="Export Everything (ZIP)" description="Coming soon - all data in one archive" icon={Package} onClick={() => { }} statusKey="zip" />
                    </div>
                </motion.div>

                {/* Summary Report */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl border" style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>Productivity Summary</h2>
                    <div className="space-y-3">
                        <ExportButton label="Weekly Summary Report" description="Deep work, categories, and insights" icon={FileText} onClick={handleSummaryPDF} statusKey="summary" />
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
