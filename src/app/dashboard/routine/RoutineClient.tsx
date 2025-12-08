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

const STORAGE_KEY = 'clarvu_routine';

export function RoutineClient() {
    const { currentTheme } = useTheme();
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
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Your AI Routine
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Based on your last two weeks of work patterns
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
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
                </motion.div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
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
                </AnimatePresence>

                {/* Routine Display */}
                <AnimatePresence mode="wait">
                    {routine && (
                        <motion.div
                            key="routine"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Routine Card */}
                            <div
                                className="p-6 rounded-2xl border backdrop-blur-sm"
                                style={{
                                    backgroundColor: currentTheme.colors.card,
                                    borderColor: currentTheme.colors.border,
                                }}
                            >
                                {/* Morning */}
                                <RoutineSection
                                    title="Morning"
                                    items={routine.morning}
                                    delay={0.1}
                                />

                                {/* Afternoon */}
                                <RoutineSection
                                    title="Afternoon"
                                    items={routine.afternoon}
                                    delay={0.2}
                                />

                                {/* Evening */}
                                <RoutineSection
                                    title="Evening"
                                    items={routine.evening}
                                    delay={0.3}
                                />

                                {/* Notes */}
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!routine && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
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
                    </motion.div>
                )}
            </div>
        </main>
    );
}
