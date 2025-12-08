'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    DeepWorkHeader,
    QualityGauge,
    ConsistencyRing,
    WeeklyDeepWorkChart,
    CategoryEffectivenessChart,
    AIInsightsCard,
} from '@/components/analytics/deepwork';

interface DeepWorkClientProps {
    sessions: {
        totalMinutes: number;
        avgMinutesPerDay: number;
        daysWithWork: number;
    } | null;
    quality: {
        qualityScore: number;
        totalMinutes: number;
        longestSession: number;
        avgSessionLength: number;
        sessionCount: number;
    } | null;
    consistency: {
        consistencyPercent: number;
        currentStreak: number;
        bestStreak: number;
        daysWorked: number;
        totalDays: number;
    } | null;
    categories: {
        categories: Array<{
            name: string;
            effectiveness: number;
            completedTasks: number;
            totalMinutes: number;
        }>;
    } | null;
    weekly: {
        trend: Array<{ date: string; minutes: number; displayDate: string }>;
        weeklyAvg: number;
    } | null;
    insights: {
        insights: string[];
    } | null;
}

export function DeepWorkClient({ sessions, quality, consistency, categories, weekly, insights }: DeepWorkClientProps) {
    const { currentTheme } = useTheme();

    return (
        <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <DeepWorkHeader
                totalMinutes={sessions?.totalMinutes || 0}
                avgDaily={sessions?.avgMinutesPerDay || 0}
                qualityScore={quality?.qualityScore || 0}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Quality & Consistency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl border"
                    style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                        <QualityGauge score={quality?.qualityScore || 0} />
                        <ConsistencyRing
                            percent={consistency?.consistencyPercent || 0}
                            currentStreak={consistency?.currentStreak || 0}
                            bestStreak={consistency?.bestStreak || 0}
                            daysWorked={consistency?.daysWorked || 0}
                            totalDays={consistency?.totalDays || 30}
                        />
                    </div>
                </motion.div>

                {/* Weekly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl border"
                    style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                >
                    {weekly && (
                        <WeeklyDeepWorkChart data={weekly.trend} weeklyAvg={weekly.weeklyAvg} />
                    )}
                </motion.div>
            </div>

            {/* Category Effectiveness */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl border mb-6"
                style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
            >
                {categories && categories.categories.length > 0 && (
                    <CategoryEffectivenessChart categories={categories.categories} />
                )}
            </motion.div>

            {/* AI Insights */}
            {insights && insights.insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AIInsightsCard insights={insights.insights} />
                </motion.div>
            )}
        </main>
    );
}
