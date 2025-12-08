'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Clock, Target } from 'lucide-react';
import { generateRoutineAction } from '@/app/dashboard/summaries/actions';

interface Insight {
    icon: React.ElementType;
    text: string;
    type: 'productivity' | 'focus' | 'tip';
}

export function AISummaryCard() {
    const { currentTheme } = useTheme();
    const [insights, setInsights] = useState<Insight[]>([
        { icon: TrendingUp, text: 'Your productivity peaks between 9-11 AM', type: 'productivity' },
        { icon: Clock, text: 'Average task completion time: 45 minutes', type: 'focus' },
        { icon: Target, text: 'Try focusing on deep work tasks first thing in the morning', type: 'tip' },
    ]);
    const [isGenerating, startTransition] = useTransition();
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleGenerate = () => {
        startTransition(async () => {
            const result = await generateRoutineAction();
            if (result.routine) {
                // Extract insights from routine notes
                const newInsights: Insight[] = [];

                if (result.routine.notes) {
                    newInsights.push({
                        icon: Lightbulb,
                        text: result.routine.notes,
                        type: 'tip'
                    });
                }

                // Add insights based on routine structure
                if (result.routine.morning?.length > 0) {
                    newInsights.push({
                        icon: TrendingUp,
                        text: `Morning routine: ${result.routine.morning.length} activities planned`,
                        type: 'productivity'
                    });
                }

                if (result.routine.afternoon?.length > 0) {
                    newInsights.push({
                        icon: Clock,
                        text: `Afternoon focus: ${result.routine.afternoon.length} tasks scheduled`,
                        type: 'focus'
                    });
                }

                if (newInsights.length > 0) {
                    setInsights(newInsights.slice(0, 3));
                }
                setHasGenerated(true);
            }
        });
    };

    const getTypeColor = (type: Insight['type']) => {
        switch (type) {
            case 'productivity': return '#22c55e';
            case 'focus': return '#3b82f6';
            case 'tip': return currentTheme.colors.accent;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="p-6 rounded-2xl border backdrop-blur-sm"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                        }}
                    >
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            AI Summary
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            Your personalized insights
                        </p>
                    </div>
                </div>

                {/* Refresh Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: currentTheme.colors.muted,
                        color: currentTheme.colors.mutedForeground,
                    }}
                >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </motion.button>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    const color = getTypeColor(insight.type);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: `${color}10` }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <p
                                className="text-sm pt-1"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                {insight.text}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Generate Button (for first time) */}
            {!hasGenerated && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full mt-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    style={{
                        backgroundColor: `${currentTheme.colors.primary}15`,
                        color: currentTheme.colors.primary,
                    }}
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating insights...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate AI Insights</span>
                        </>
                    )}
                </motion.button>
            )}
        </motion.div>
    );
}
