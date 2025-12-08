'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getTaskFunnel, getDeepWorkFunnel } from '@/app/ppadminpp/actions';
import { Filter, Focus } from 'lucide-react';

interface FunnelData {
    stage: string;
    count: number;
    percentage: number;
}

export function TaskFunnelChart() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<FunnelData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getTaskFunnel();
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
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                >
                    <Filter className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Task Completion Funnel
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Task lifecycle stages
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-40 skeleton rounded-xl" />
            ) : (
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <motion.div
                            key={item.stage}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm" style={{ color: currentTheme.colors.foreground }}>
                                    {item.stage}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    {item.count} ({item.percentage}%)
                                </span>
                            </div>
                            <div
                                className="h-6 rounded-lg overflow-hidden"
                                style={{ backgroundColor: currentTheme.colors.border }}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percentage}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="h-full rounded-lg"
                                    style={{
                                        background: `linear-gradient(90deg, #3b82f6 0%, #60a5fa ${100 - item.percentage}%)`,
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export function DeepWorkFunnel() {
    const { currentTheme } = useTheme();
    const [data, setData] = useState<FunnelData[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const result = await getDeepWorkFunnel();
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
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
                >
                    <Focus className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        Deep Work Funnel
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Focus session milestones
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="h-40 skeleton rounded-xl" />
            ) : (
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <motion.div
                            key={item.stage}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm" style={{ color: currentTheme.colors.foreground }}>
                                    {item.stage}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.foreground }}>
                                    {item.count} ({item.percentage}%)
                                </span>
                            </div>
                            <div
                                className="h-6 rounded-lg overflow-hidden"
                                style={{ backgroundColor: currentTheme.colors.border }}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percentage}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="h-full rounded-lg"
                                    style={{
                                        background: `linear-gradient(90deg, #a855f7 0%, #c084fc ${100 - item.percentage}%)`,
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
