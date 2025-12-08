'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Brain, TrendingUp, Clock } from 'lucide-react';

interface DeepWorkHeaderProps {
    totalMinutes: number;
    avgDaily: number;
    qualityScore: number;
}

export function DeepWorkHeader({ totalMinutes, avgDaily, qualityScore }: DeepWorkHeaderProps) {
    const { currentTheme } = useTheme();

    const stats = [
        { label: 'Total Deep Work', value: `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`, icon: Clock },
        { label: 'Daily Average', value: `${avgDaily}m`, icon: TrendingUp },
        { label: 'Quality Score', value: `${qualityScore}%`, icon: Brain },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})` }}
                >
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>Deep Work Analytics</h1>
                    <p style={{ color: currentTheme.colors.mutedForeground }}>Your focus and productivity insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-2xl border"
                        style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                                <stat.icon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.foreground }}>{stat.value}</p>
                                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
