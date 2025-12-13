'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Check, X } from 'lucide-react';
import { Goal, completeGoal } from '@/app/goals/actions/goalsActions';
import { toast } from 'sonner';

interface GoalCheckInModalProps {
    goal: Goal;
    onClose: () => void;
    onUpdate: () => void;
}

export function GoalCheckInModal({ goal, onClose, onUpdate }: GoalCheckInModalProps) {
    const { currentTheme } = useTheme();
    const [reflection, setReflection] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Period display helper
    const getPeriodLabel = (p: string) => {
        if (p === '7d') return '7-Day Goal';
        if (p === '30d') return 'Monthly Goal';
        if (p === '365d') return 'Yearly Goal';
        return 'Goal';
    };

    const handleComplete = async (accomplished: boolean) => {
        setIsSubmitting(true);
        try {
            const result = await completeGoal(goal.id, accomplished, reflection || undefined);
            if (result.success) {
                toast.success(accomplished ? 'Goal completed!' : 'Goal closed.');
                onUpdate();
                onClose();
            } else {
                toast.error(result.error || 'Failed to update goal');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.primary}20` }}>
                            <Check className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                        </div>

                        <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                            {getPeriodLabel(goal.period)} Ended
                        </h2>

                        <div className="px-4 py-3 rounded-lg bg-black/5 border" style={{ borderColor: currentTheme.colors.border }}>
                            <p className="text-lg font-medium" style={{ color: currentTheme.colors.foreground }}>
                                "{goal.goal_text}"
                            </p>
                        </div>

                        <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                            Did you accomplish this goal? BE HONEST.
                        </p>

                        <div className="pt-2">
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="Optional: One sentence reflection..."
                                className="w-full p-3 rounded-xl border bg-transparent text-sm resize-none focus:outline-none focus:ring-1"
                                rows={2}
                                style={{
                                    borderColor: currentTheme.colors.border,
                                    color: currentTheme.colors.foreground,
                                    ['--tw-ring-color' as any]: currentTheme.colors.primary
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handleComplete(false)}
                                disabled={isSubmitting}
                                className="px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.mutedForeground
                                }}
                            >
                                <X className="w-4 h-4" />
                                No, I didn't
                            </button>

                            <button
                                onClick={() => handleComplete(true)}
                                disabled={isSubmitting}
                                className="px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground
                                }}
                            >
                                <Check className="w-4 h-4" />
                                Yes, I did!
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
