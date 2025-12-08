'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getCohortWaterfall, getPowerUsers } from '@/app/ppadminpp/actions';
import { Layers, Crown } from 'lucide-react';

interface CohortData {
    cohort: string;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
}

interface PowerUser {
    rank: number;
    userId: string;
    name: string;
    totalMinutes: number;
    avgDeepWork: number;
    streak: number;
}

export function CohortWaterfall() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<CohortData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getCohortWaterfall();
            if (result.data) setData(result.data);
        });
    }, []);

    const getHeatColor = (value: number) => {
        if (value >= 80) return '#22c55e';
        if (value >= 60) return '#3b82f6';
        if (value >= 40) return '#f59e0b';
        if (value >= 20) return '#fb923c';
        return '#ef4444';
    };

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
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                >
                    <Layers className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Cohort Retention
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Weekly retention by signup week
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-48 skeleton rounded-xl" />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Cohort
                                </th>
                                <th className="text-center py-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Week 1
                                </th>
                                <th className="text-center py-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Week 2
                                </th>
                                <th className="text-center py-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Week 3
                                </th>
                                <th className="text-center py-2" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Week 4
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(row => (
                                <tr key={row.cohort}>
                                    <td className="py-2" style={{ color: currentTheme.colors.foreground }}>
                                        {row.cohort}
                                    </td>
                                    {[row.week1, row.week2, row.week3, row.week4].map((val, i) => (
                                        <td key={i} className="text-center py-2">
                                            <span
                                                className="px-3 py-1 rounded-lg font-semibold text-white"
                                                style={{ backgroundColor: getHeatColor(val) }}
                                            >
                                                {val}%
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

export function PowerUsersTable() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<PowerUser[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getPowerUsers();
            if (result.data) setData(result.data);
        });
    }, []);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return { bg: '#fbbf24', color: '#000' };
        if (rank === 2) return { bg: '#94a3b8', color: '#000' };
        if (rank === 3) return { bg: '#cd7f32', color: '#fff' };
        return { bg: currentTheme.colors.border, color: currentTheme.colors.foreground };
    };

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
                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}
                >
                    <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Power Users
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Top performers by total time
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
                    {data.map(user => {
                        const rankStyle = getRankStyle(user.rank);
                        return (
                            <motion.div
                                key={user.userId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: user.rank * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ backgroundColor: `${currentTheme.colors.primary}08` }}
                            >
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: rankStyle.bg, color: rankStyle.color }}
                                >
                                    {user.rank}
                                </span>
                                <div className="flex-1">
                                    <span className="text-sm font-medium" style={{ color: currentTheme.colors.foreground }}>
                                        {user.name}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold" style={{ color: currentTheme.colors.primary }}>
                                        {Math.floor(user.totalMinutes / 60)}h {user.totalMinutes % 60}m
                                    </div>
                                    <div className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                        Avg {user.avgDeepWork}m deep · {user.streak}d streak
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
