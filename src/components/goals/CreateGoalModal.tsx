'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { createGoal, type GoalPeriod } from '@/app/calendar/actions/goalsActions';
import { useGoalsStore } from '@/lib/store/useGoalsStore';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDeadline?: Date;
}

const GOAL_TYPES: { value: GoalPeriod; label: string; description: string }[] = [
    { value: '7d', label: '7-Day Goal', description: 'One week of focused progress' },
    { value: '30d', label: 'Monthly Goal', description: 'Build momentum over a month' },
    { value: '365d', label: 'Yearly Goal', description: 'Long-term vision and growth' },
];

export function CreateGoalModal({ isOpen, onClose, initialDeadline }: CreateGoalModalProps) {
    const { currentTheme } = useTheme();
    const { addGoal } = useGoalsStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState<GoalPeriod>('7d');
    const [useCustomDeadline, setUseCustomDeadline] = useState(false);
    const [customDeadline, setCustomDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set initial deadline when provided
    useEffect(() => {
        if (isOpen && initialDeadline && initialDeadline instanceof Date) {
            setUseCustomDeadline(true);
            const dateStr = initialDeadline.toISOString().split('T')[0];
            setCustomDeadline(dateStr);
        }
    }, [isOpen, initialDeadline]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Goal title is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createGoal({
                title: title.trim(),
                description: description.trim() || undefined,
                period,
                progress_percentage: 0,
                priority: 'medium',
            });

            if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                return;
            }

            if (result.goal) {
                // Add to store
                addGoal(result.goal);
            }

            // Reset form and close
            setTitle('');
            setDescription('');
            setPeriod('7d');
            onClose();
        } catch (err) {
            setError('Failed to create goal');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTitle('');
            setDescription('');
            setPeriod('7d');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 backdrop-blur-sm"
                    style={{ backgroundColor: `${currentTheme.colors.background}80` }}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', duration: 0.3 }}
                    className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-xl"
                                style={{ backgroundColor: `${currentTheme.colors.primary}15` }}
                            >
                                <Target className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                                    Create Goal
                                </h2>
                                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Set your intention
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Goal Type Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium" style={{ color: currentTheme.colors.foreground }}>
                                    Goal Type
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setUseCustomDeadline(!useCustomDeadline)}
                                    className="text-xs px-2 py-1 rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: useCustomDeadline ? `${currentTheme.colors.primary}15` : 'transparent',
                                        color: useCustomDeadline ? currentTheme.colors.primary : currentTheme.colors.mutedForeground,
                                    }}
                                >
                                    {useCustomDeadline ? '📅 Custom Deadline' : '⏱️ Period-based'}
                                </button>
                            </div>
                            {!useCustomDeadline ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {GOAL_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setPeriod(type.value)}
                                            className="p-3 rounded-xl border transition-all text-left"
                                            style={{
                                                backgroundColor: period === type.value ? `${currentTheme.colors.primary}15` : 'transparent',
                                                borderColor: period === type.value ? currentTheme.colors.primary : currentTheme.colors.border,
                                                color: period === type.value ? currentTheme.colors.primary : currentTheme.colors.foreground,
                                            }}
                                        >
                                            <div className="font-semibold text-sm">{type.label}</div>
                                            <div className="text-xs mt-0.5 opacity-70">{type.description}</div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="date"
                                        value={customDeadline}
                                        onChange={(e) => setCustomDeadline(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                        style={{
                                            backgroundColor: currentTheme.colors.background,
                                            borderColor: currentTheme.colors.border,
                                            color: currentTheme.colors.foreground,
                                        }}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Goal Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What do you want to achieve?"
                                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: currentTheme.colors.background,
                                    borderColor: currentTheme.colors.border,
                                    color: currentTheme.colors.foreground,
                                }}
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details about your goal..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
                                style={{
                                    backgroundColor: currentTheme.colors.background,
                                    borderColor: currentTheme.colors.border,
                                    color: currentTheme.colors.foreground,
                                }}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim()}
                                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                }}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Goal'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
