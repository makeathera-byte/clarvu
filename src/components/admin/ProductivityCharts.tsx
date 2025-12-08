'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getProductivityIndex, getProductivityDistribution } from '@/app/ppadminpp/actions';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductivityUser {
    userId: string;
    name: string;
    score: number;
    deepWorkMinutes: number;
    distractionMinutes: number;
}

export function ProductivityIndexCard() {
    const { currentTheme } = useTheme();
    const [users, setUsers] = useState<ProductivityUser[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getProductivityIndex();
            if (result.data) setUsers(result.data.slice(0, 5));
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
                    <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Productivity Index
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Score = deepWork - distractions × 0.5
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 skeleton rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ backgroundColor: `${currentTheme.colors.primary}08` }}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                        backgroundColor: index === 0 ? '#22c55e' : currentTheme.colors.border,
                                        color: index === 0 ? 'white' : currentTheme.colors.foreground,
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <span className="text-sm" style={{ color: currentTheme.colors.foreground }}>
                                    {user.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-green-500">{user.score}</span>
                                <span className="text-xs ml-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    ({user.deepWorkMinutes}m deep / {user.distractionMinutes}m distracted)
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export function ProductivityHistogram() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<Array<{ bucket: string; count: number }>>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getProductivityDistribution();
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
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                >
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Productivity Distribution
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Score buckets across all users
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-40 skeleton rounded-xl" />
            ) : (
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
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
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
