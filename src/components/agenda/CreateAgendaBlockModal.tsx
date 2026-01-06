'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sun, Sunset, Sunrise, Clock } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { createAgendaBlock, type TimeOfDay } from '@/app/calendar/actions/agendaActions';
import { useAgendaStore } from '@/lib/store/useAgendaStore';
import { useGoalsStore } from '@/lib/store/useGoalsStore';

interface CreateAgendaBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: Date;
}

const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string; icon: typeof Sunrise }[] = [
    { value: 'morning', label: 'Morning', icon: Sunrise },
    { value: 'afternoon', label: 'Afternoon', icon: Sun },
    { value: 'evening', label: 'Evening', icon: Sunset },
    { value: 'all_day', label: 'All Day', icon: Clock },
];

const PRESET_COLORS = [
    '#6b7280', // Gray
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#10b981', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
];

export function CreateAgendaBlockModal({ isOpen, onClose, initialDate }: CreateAgendaBlockModalProps) {
    const { currentTheme } = useTheme();
    const { addBlock } = useAgendaStore();
    const { goals } = useGoalsStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('all_day');
    const [color, setColor] = useState('#6b7280');
    const [linkedGoalId, setLinkedGoalId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize dates
    useEffect(() => {
        if (isOpen) {
            const date = initialDate || new Date();
            const dateStr = date.toISOString().split('T')[0];
            setStartDate(dateStr);
            setEndDate(dateStr);
        }
    }, [isOpen, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!startDate || !endDate) {
            setError('Please select a date');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createAgendaBlock({
                title: title.trim(),
                description: description.trim() || undefined,
                start_date: startDate,
                end_date: endDate,
                time_of_day: timeOfDay,
                color,
                linked_goal_id: linkedGoalId || undefined,
            });

            if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                return;
            }

            if (result.block) {
                addBlock(result.block);
            }

            // Reset form and close
            handleReset();
            onClose();
        } catch (err) {
            setError('Failed to create agenda block');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setTimeOfDay('all_day');
        setColor('#6b7280');
        setLinkedGoalId('');
        setError(null);
    };

    if (!isOpen) return null;

    const activeGoals = goals.filter(g => g.status === 'active');

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
                    className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto"
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
                                <Calendar className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.foreground }}>
                                    Create Agenda Block
                                </h2>
                                <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Plan your time
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
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Deep work session, Sales outreach..."
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

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        // Auto-update end date if it's before start date
                                        if (endDate && e.target.value > endDate) {
                                            setEndDate(e.target.value);
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: currentTheme.colors.background,
                                        borderColor: currentTheme.colors.border,
                                        color: currentTheme.colors.foreground,
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: currentTheme.colors.background,
                                        borderColor: currentTheme.colors.border,
                                        color: currentTheme.colors.foreground,
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Time of Day */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Time of Day
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {TIME_OF_DAY_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTimeOfDay(option.value)}
                                            className="p-3 rounded-xl border transition-all flex flex-col items-center gap-1"
                                            style={{
                                                backgroundColor: timeOfDay === option.value ? `${currentTheme.colors.primary}15` : 'transparent',
                                                borderColor: timeOfDay === option.value ? currentTheme.colors.primary : currentTheme.colors.border,
                                                color: timeOfDay === option.value ? currentTheme.colors.primary : currentTheme.colors.foreground,
                                            }}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-xs font-medium">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map((presetColor) => (
                                    <button
                                        key={presetColor}
                                        type="button"
                                        onClick={() => setColor(presetColor)}
                                        className="w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110"
                                        style={{
                                            backgroundColor: presetColor,
                                            borderColor: color === presetColor ? currentTheme.colors.foreground : 'transparent',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Link to Goal */}
                        {activeGoals.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                    Link to Goal (Optional)
                                </label>
                                <select
                                    value={linkedGoalId}
                                    onChange={(e) => setLinkedGoalId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: currentTheme.colors.background,
                                        borderColor: currentTheme.colors.border,
                                        color: currentTheme.colors.foreground,
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <option value="">No goal linked</option>
                                    {activeGoals.map((goal) => (
                                        <option key={goal.id} value={goal.id}>
                                            {goal.goal_text} ({goal.period})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details about this agenda block..."
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
                                {isSubmitting ? 'Creating...' : 'Create Block'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
