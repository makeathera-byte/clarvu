'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getUserLifecycleStages } from '@/app/ppadminpp/actions';
import { Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STAGE_COLORS: Record<string, string> = {
    'New': '#22c55e',
    'Active': '#3b82f6',
    'Returning': '#a855f7',
    'Slipping': '#f59e0b',
    'Churn Risk': '#ef4444',
};

interface LifecycleData {
    stage: string;
    count: number;
    users: Array<{ id: string; name: string }>;
}

export function LifecycleDonutChart() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<LifecycleData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getUserLifecycleStages();
            if (result.data) setData(result.data);
        });
    }, []);

    const chartData = data.map(d => ({
        name: d.stage,
        value: d.count,
        color: STAGE_COLORS[d.stage] || '#6b7280',
    }));

    const total = data.reduce((sum, d) => sum + d.count, 0);

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
                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
                >
                    <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        User Lifecycle
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Engagement stages
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-48 skeleton rounded-xl" />
            ) : (
                <div className="flex gap-6">
                    <div className="h-48 w-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={45}
                                >
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
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

                    <div className="flex-1 space-y-2">
                        {data.map(stage => (
                            <div key={stage.stage} className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: STAGE_COLORS[stage.stage] }}
                                />
                                <span className="text-sm flex-1" style={{ color: currentTheme.colors.foreground }}>
                                    {stage.stage}
                                </span>
                                <span className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    {stage.count}
                                </span>
                                <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                    ({total > 0 ? Math.round((stage.count / total) * 100) : 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export function LifecycleTable() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<LifecycleData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getUserLifecycleStages();
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
            <h3 className="font-semibold mb-4" style={{ color: currentTheme.colors.foreground }}>
                Users by Stage
            </h3>

            {isPending ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 skeleton rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map(stage => (
                        <div
                            key={stage.stage}
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${STAGE_COLORS[stage.stage]}15` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: STAGE_COLORS[stage.stage] }}
                                >
                                    {stage.stage}
                                </span>
                                <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                        backgroundColor: STAGE_COLORS[stage.stage],
                                        color: 'white',
                                    }}
                                >
                                    {stage.count} users
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {stage.users.slice(0, 5).map(user => (
                                    <span
                                        key={user.id}
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: currentTheme.colors.border,
                                            color: currentTheme.colors.mutedForeground,
                                        }}
                                    >
                                        {user.name}
                                    </span>
                                ))}
                                {stage.users.length > 5 && (
                                    <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                        +{stage.users.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
