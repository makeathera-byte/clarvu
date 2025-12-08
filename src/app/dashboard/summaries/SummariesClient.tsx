'use client';

import { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { RoutineSection } from '@/components/routine';
import { generateRoutineAction } from './actions';
import {
    Sparkles,
    RefreshCw,
    Lightbulb,
    AlertCircle,
    Calendar,
    BarChart3,
    TrendingUp,
    CalendarDays,
} from 'lucide-react';

interface RoutineItem {
    time: string;
    activity: string;
    duration: string;
    category?: string;
}

interface RoutineResult {
    morning: RoutineItem[];
    afternoon: RoutineItem[];
    evening: RoutineItem[];
    notes: string;
}

const STORAGE_KEY = 'dayflow_routine';

type TabType = 'daily' | 'weekly' | 'monthly' | 'routine';

export function SummariesClient() {
    const { currentTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('daily');
    const [routine, setRoutine] = useState<RoutineResult | null>(null);
    const [isGenerating, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRoutine(parsed);
                setHasGenerated(true);
            } catch (e) {
                console.error('Failed to parse stored routine:', e);
            }
        }
    }, []);

    // Save to localStorage when routine changes
    useEffect(() => {
        if (routine) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(routine));
        }
    }, [routine]);

    const handleGenerate = () => {
        setError(null);
        startTransition(async () => {
            const result = await generateRoutineAction();

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.routine) {
                setRoutine(result.routine);
                setHasGenerated(true);
            }
        });
    };

    const tabs = [
        { id: 'daily' as const, label: 'Daily', icon: BarChart3 },
        { id: 'weekly' as const, label: 'Weekly', icon: TrendingUp },
        { id: 'monthly' as const, label: 'Monthly', icon: CalendarDays },
        { id: 'routine' as const, label: 'AI Routine', icon: Sparkles },
    ];

    return (
        <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                            }}
                        >
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Summaries & Routine
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                View your productivity summaries and AI routine
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div
                        className="flex rounded-xl p-1 gap-1"
                        style={{ backgroundColor: currentTheme.colors.muted }}
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        backgroundColor: isActive ? currentTheme.colors.card : 'transparent',
                                        color: isActive ? currentTheme.colors.foreground : currentTheme.colors.mutedForeground,
                                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'daily' && (
                        <motion.div
                            key="daily"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border p-6"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <h3
                                className="text-lg font-semibold mb-4"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Daily Summary
                            </h3>
                            <p style={{ color: currentTheme.colors.mutedForeground }}>
                                Your daily productivity summary will appear here. Track your completed tasks,
                                time spent in each category, and overall focus score.
                            </p>
                        </motion.div>
                    )}

                    {activeTab === 'weekly' && (
                        <motion.div
                            key="weekly"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border p-6"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <h3
                                className="text-lg font-semibold mb-4"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Weekly Summary
                            </h3>
                            <p style={{ color: currentTheme.colors.mutedForeground }}>
                                Your weekly productivity trends will appear here. See patterns in your work,
                                compare category distributions, and identify peak productivity days.
                            </p>
                        </motion.div>
                    )}

                    {activeTab === 'monthly' && (
                        <motion.div
                            key="monthly"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border p-6"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border,
                            }}
                        >
                            <h3
                                className="text-lg font-semibold mb-4"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Monthly Summary
                            </h3>
                            <p style={{ color: currentTheme.colors.mutedForeground }}>
                                Your monthly overview will appear here. Track long-term progress,
                                goal completion, and monthly highlights.
                            </p>
                        </motion.div>
                    )}

                    {activeTab === 'routine' && (
                        <motion.div
                            key="routine"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Action Button */}
                            <div className="mb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-medium text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`,
                                        boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                                    }}
                                >
                                    {isGenerating ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                            </motion.div>
                                            <span>Analyzing your patterns...</span>
                                        </>
                                    ) : hasGenerated ? (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            <span>Regenerate Routine</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Generate My Routine</span>
                                        </>
                                    )}
                                </motion.button>

                                {!hasGenerated && (
                                    <p
                                        className="text-sm mt-3 flex items-center gap-2"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Uses your tasks, categories, and calendar events
                                    </p>
                                )}
                            </div>

                            {/* Error State */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 rounded-xl flex items-center gap-3"
                                    style={{
                                        backgroundColor: '#ef444415',
                                        border: '1px solid #ef444430',
                                    }}
                                >
                                    <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                                    <span style={{ color: '#ef4444' }}>{error}</span>
                                </motion.div>
                            )}

                            {/* Routine Display */}
                            {routine ? (
                                <div
                                    className="p-6 rounded-2xl border backdrop-blur-sm"
                                    style={{
                                        backgroundColor: currentTheme.colors.card,
                                        borderColor: currentTheme.colors.border,
                                    }}
                                >
                                    <RoutineSection title="Morning" items={routine.morning} delay={0.1} />
                                    <RoutineSection title="Afternoon" items={routine.afternoon} delay={0.2} />
                                    <RoutineSection title="Evening" items={routine.evening} delay={0.3} />

                                    {routine.notes && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            className="mt-6 p-4 rounded-xl flex gap-3"
                                            style={{
                                                backgroundColor: `${currentTheme.colors.primary}10`,
                                                border: `1px solid ${currentTheme.colors.primary}20`,
                                            }}
                                        >
                                            <Lightbulb
                                                className="w-5 h-5 shrink-0 mt-0.5"
                                                style={{ color: currentTheme.colors.primary }}
                                            />
                                            <div>
                                                <p
                                                    className="text-sm font-medium mb-1"
                                                    style={{ color: currentTheme.colors.primary }}
                                                >
                                                    AI Insights
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: currentTheme.colors.foreground }}
                                                >
                                                    {routine.notes}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : !isGenerating ? (
                                <div
                                    className="text-center py-16 rounded-2xl border"
                                    style={{
                                        backgroundColor: currentTheme.colors.card,
                                        borderColor: currentTheme.colors.border,
                                    }}
                                >
                                    <Sparkles
                                        className="w-16 h-16 mx-auto mb-4"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    />
                                    <h3
                                        className="text-lg font-semibold mb-2"
                                        style={{ color: currentTheme.colors.foreground }}
                                    >
                                        No routine generated yet
                                    </h3>
                                    <p
                                        className="text-sm max-w-sm mx-auto"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    >
                                        Click &quot;Generate My Routine&quot; to create a personalized daily schedule based on your work patterns.
                                    </p>
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
