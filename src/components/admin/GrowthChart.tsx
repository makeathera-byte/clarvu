'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getUserGrowth } from '@/app/ppadminpp/actions';
import { TrendingUp, Users } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface GrowthData {
    date: string;
    signups: number;
}

export function GrowthChart() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<GrowthData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getUserGrowth(14);
            if (result.data) {
                setData(result.data);
            }
        });
    }, []);

    const totalSignups = data.reduce((sum, d) => sum + d.signups, 0);
    const avgPerDay = data.length > 0 ? (totalSignups / data.length).toFixed(1) : '0';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border backdrop-blur-sm p-6"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${currentTheme.colors.primary}15` }}
                    >
                        <TrendingUp className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            User Growth
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Last 14 days
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p
                        className="text-2xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {totalSignups}
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        Total signups · ~{avgPerDay}/day
                    </p>
                </div>
            </div>

            {/* Chart */}
            {isPending ? (
                <div className="h-64 skeleton rounded-xl" />
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentTheme.colors.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentTheme.colors.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 11 }}
                                stroke="rgba(255,255,255,0.1)"
                            />
                            <YAxis
                                tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 11 }}
                                stroke="rgba(255,255,255,0.1)"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentTheme.colors.card,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}
                                labelStyle={{ color: currentTheme.colors.foreground }}
                                itemStyle={{ color: currentTheme.colors.primary }}
                                formatter={(value: number) => [value, 'Signups']}
                                labelFormatter={(label) => formatDate(label)}
                            />
                            <Area
                                type="monotone"
                                dataKey="signups"
                                stroke={currentTheme.colors.primary}
                                strokeWidth={2}
                                fill="url(#growthGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
