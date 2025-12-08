'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sparkles } from 'lucide-react';

interface AIInsightsCardProps {
    insights: string[];
}

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="p-6 rounded-2xl border"
            style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})` }}
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.foreground }}>
                        AI Insights
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                        Personalized recommendations
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: `${currentTheme.colors.primary}10` }}
                    >
                        <span className="text-sm" style={{ color: currentTheme.colors.primary }}>•</span>
                        <p className="text-sm" style={{ color: currentTheme.colors.foreground }}>{insight}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
