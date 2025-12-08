'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    syncGoogleCalendarAction,
    disconnectGoogleCalendar
} from './actions';
import {
    Calendar,
    RefreshCw,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Link2Off,
} from 'lucide-react';

interface IntegrationsClientProps {
    isConnected: boolean;
    lastSynced?: string | null;
    successMessage?: string | null;
    errorMessage?: string | null;
}

export function IntegrationsClient({
    isConnected,
    lastSynced,
    successMessage,
    errorMessage,
}: IntegrationsClientProps) {
    const { currentTheme } = useTheme();
    const [isSyncing, startSyncTransition] = useTransition();
    const [isDisconnecting, startDisconnectTransition] = useTransition();
    const [syncResult, setSyncResult] = useState<string | null>(null);

    const handleSync = () => {
        setSyncResult(null);
        startSyncTransition(async () => {
            const result = await syncGoogleCalendarAction();
            if (result.success) {
                setSyncResult('Events synced successfully!');
            } else {
                setSyncResult(result.error || 'Sync failed');
            }
        });
    };

    const handleDisconnect = () => {
        startDisconnectTransition(async () => {
            await disconnectGoogleCalendar();
            window.location.reload();
        });
    };

    const formatLastSynced = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Integrations
                    </h1>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>
                        Connect external services to enhance your productivity
                    </p>
                </motion.div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl flex items-center gap-3"
                        style={{
                            backgroundColor: '#22c55e15',
                            border: '1px solid #22c55e30',
                        }}
                    >
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                        <span style={{ color: '#22c55e' }}>{successMessage}</span>
                    </motion.div>
                )}

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl flex items-center gap-3"
                        style={{
                            backgroundColor: '#ef444415',
                            border: '1px solid #ef444430',
                        }}
                    >
                        <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                        <span style={{ color: '#ef4444' }}>{errorMessage}</span>
                    </motion.div>
                )}

                {/* Sync Result */}
                {syncResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl flex items-center gap-3"
                        style={{
                            backgroundColor: syncResult.includes('success') ? '#22c55e15' : '#ef444415',
                            border: `1px solid ${syncResult.includes('success') ? '#22c55e30' : '#ef444430'}`,
                        }}
                    >
                        {syncResult.includes('success') ? (
                            <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                        ) : (
                            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                        )}
                        <span style={{ color: syncResult.includes('success') ? '#22c55e' : '#ef4444' }}>
                            {syncResult}
                        </span>
                    </motion.div>
                )}

                {/* Google Calendar Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl border backdrop-blur-sm"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    {/* Integration Header */}
                    <div className="flex items-start gap-4 mb-6">
                        {/* Google Calendar Icon */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: '#4285F415' }}
                        >
                            <Calendar className="w-7 h-7" style={{ color: '#4285F4' }} />
                        </div>

                        <div className="flex-1">
                            <h2
                                className="text-xl font-semibold mb-1"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Google Calendar
                            </h2>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Sync your calendar events to see them in your dashboard
                            </p>
                        </div>

                        {/* Status Badge */}
                        {isConnected ? (
                            <span
                                className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                                style={{
                                    backgroundColor: '#22c55e15',
                                    color: '#22c55e',
                                }}
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                            </span>
                        ) : (
                            <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.mutedForeground,
                                }}
                            >
                                Not connected
                            </span>
                        )}
                    </div>

                    {/* Connected State */}
                    {isConnected ? (
                        <div className="space-y-4">
                            {/* Last synced */}
                            {lastSynced && (
                                <p
                                    className="text-sm"
                                    style={{ color: currentTheme.colors.mutedForeground }}
                                >
                                    Last synced: {formatLastSynced(lastSynced)}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
                                    style={{
                                        backgroundColor: '#4285F4',
                                        color: '#fff',
                                    }}
                                >
                                    {isSyncing ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </motion.div>
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDisconnect}
                                    disabled={isDisconnecting}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium border"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#ef4444',
                                        borderColor: '#ef444430',
                                    }}
                                >
                                    <Link2Off className="w-4 h-4" />
                                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        /* Not Connected State */
                        <div>
                            <p
                                className="text-sm mb-4"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Connect your Google Calendar to see today&apos;s events in your dashboard
                                and integrate with your task workflow.
                            </p>

                            <motion.a
                                href="/api/integrations/google"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
                                style={{
                                    backgroundColor: '#4285F4',
                                    color: '#fff',
                                }}
                            >
                                <Calendar className="w-4 h-4" />
                                Connect Google Calendar
                                <ExternalLink className="w-4 h-4" />
                            </motion.a>
                        </div>
                    )}
                </motion.div>

                {/* Future Integrations Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-6 rounded-2xl border border-dashed"
                    style={{
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <p
                        className="text-center text-sm"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        More integrations coming soon...
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
