'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Calendar, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

interface CalendarStatusProps {
    status: {
        totalConnected: number;
        expiredTokens: number;
        recentSyncs: number;
    };
}

export function CalendarStatus({ status }: CalendarStatusProps) {
    const { currentTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl border backdrop-blur-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: currentTheme.colors.foreground }}
            >
                <Calendar className="w-5 h-5" style={{ color: '#4285F4' }} />
                Calendar Integration Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Connected */}
                <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(66, 133, 244, 0.1)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-blue-500">Connected</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-500">
                        {status.totalConnected}
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Users with Google Calendar
                    </p>
                </div>

                {/* Expired Tokens */}
                <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: status.expiredTokens > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${status.expiredTokens > 0 ? 'text-red-500' : 'text-green-500'}`} />
                        <span className={`text-sm ${status.expiredTokens > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            Expired Tokens
                        </span>
                    </div>
                    <p className={`text-3xl font-bold ${status.expiredTokens > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {status.expiredTokens}
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Need token refresh
                    </p>
                </div>

                {/* Recent Syncs */}
                <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500">Recent Syncs</span>
                    </div>
                    <p className="text-3xl font-bold text-green-500">
                        {status.recentSyncs}
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Synced in last 24h
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
