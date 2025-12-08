'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getSessionDurationDistribution, getLoginFrequencyBuckets } from '@/app/ppadminpp/actions';
import { Clock, LogIn } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SessionDurationHistogram() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<Array<{ bucket: string; count: number }>>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getSessionDurationDistribution();
            if (result.data) setData(result.data);
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                >
                    <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Session Duration
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Distribution of task durations
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-48 skeleton rounded-xl" />
            ) : (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="bucket" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                            <YAxis tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentTheme.colors.card,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                    borderRadius: '12px',
                                }}
                            />
                            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}

export function LoginFrequencyChart() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<Array<{ bucket: string; count: number }>>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getLoginFrequencyBuckets();
            if (result.data) setData(result.data);
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                >
                    <LogIn className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Login Frequency
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        User retention indicator
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-48 skeleton rounded-xl" />
            ) : (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="bucket" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                            <YAxis tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentTheme.colors.card,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                    borderRadius: '12px',
                                }}
                            />
                            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
