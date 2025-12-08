'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getDeviceAnalytics, getBrowserAnalytics, getOSAnalytics } from '@/app/ppadminpp/actions';
import { Smartphone, Monitor, Globe } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const DEVICE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];

export function DeviceAnalyticsSection() {
    const { currentTheme } = useTheme();
    const [devices, setDevices] = useState<Array<{ device: string; count: number; percentage: number }>>([]);
    const [browsers, setBrowsers] = useState<Array<{ browser: string; count: number }>>([]);
    const [os, setOS] = useState<Array<{ os: string; count: number }>>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const [devResult, brResult, osResult] = await Promise.all([
                getDeviceAnalytics(),
                getBrowserAnalytics(),
                getOSAnalytics(),
            ]);
            if (devResult.data) setDevices(devResult.data);
            if (brResult.data) setBrowsers(brResult.data);
            if (osResult.data) setOS(osResult.data);
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Device Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                        >
                            <Smartphone className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: currentTheme.colors.foreground }}>
                            Device Types
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-40 skeleton rounded-xl" />
                    ) : (
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={devices}
                                        dataKey="count"
                                        nameKey="device"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        innerRadius={35}
                                    >
                                        {devices.map((_, i) => (
                                            <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-2">
                        {devices.map((d, i) => (
                            <div key={d.device} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEVICE_COLORS[i] }} />
                                <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                    {d.device} ({d.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Browser Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                        >
                            <Globe className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: currentTheme.colors.foreground }}>
                            Browsers
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-48 skeleton rounded-xl" />
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={browsers} layout="vertical" margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                                    <YAxis dataKey="browser" type="category" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>

                {/* OS Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-3xl border"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
                        >
                            <Monitor className="w-4 h-4 text-purple-500" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: currentTheme.colors.foreground }}>
                            Operating Systems
                        </span>
                    </div>
                    {isPending ? (
                        <div className="h-48 skeleton rounded-xl" />
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={os} layout="vertical" margin={{ left: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                                    <YAxis dataKey="os" type="category" tick={{ fill: currentTheme.colors.mutedForeground, fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
