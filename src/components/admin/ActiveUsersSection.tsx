'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getActiveUsersData } from '@/app/ppadminpp/actions';
import { Activity, Users, TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface ActiveUsersData {
    date: string;
    dau: number;
    wau: number;
}

export function ActiveUsersSection() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<ActiveUsersData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getActiveUsersData(14);
            if (result.data) {
                setData(result.data);
            }
        });
    }, []);

    const latestDAU = data.length > 0 ? data[data.length - 1].dau : 0;
    const latestWAU = data.length > 0 ? data[data.length - 1].wau : 0;
    const dauWauRatio = latestWAU > 0 ? ((latestDAU / latestWAU) * 100).toFixed(1) : '0';

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DAU Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                        >
                            <Activity className="w-4 h-4 text-green-500" />
                        </div>
                        <span style={{ color: currentTheme.colors.mutedForeground }}>Daily Active</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {latestDAU}
                    </p>
                </motion.div>

                {/* WAU Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                        >
                            <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <span style={{ color: currentTheme.colors.mutedForeground }}>Weekly Active</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {latestWAU}
                    </p>
                </motion.div>

                {/* DAU/WAU Ratio */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-2xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
                        >
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <span style={{ color: currentTheme.colors.mutedForeground }}>DAU/WAU Ratio</span>
                    </div>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {dauWauRatio}%
                    </p>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DAU Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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
                        Daily Active Users Trend
                    </h4>
                    {isPending ? (
                        <div className="h-48 skeleton rounded-xl" />
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <YAxis
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="dau"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                        name="DAU"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>

                {/* WAU Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
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
                        Weekly Active Users
                    </h4>
                    {isPending ? (
                        <div className="h-48 skeleton rounded-xl" />
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <YAxis
                                        tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }}
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Bar
                                        dataKey="wau"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        name="WAU"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
