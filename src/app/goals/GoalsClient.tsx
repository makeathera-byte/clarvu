'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    Goal, GoalPeriod, GoalPriority,
    createGoal, deleteGoal, updateGoalProgress, updateGoalPriority,
    addSubGoal, toggleSubGoal, updateGoalNotes
} from './actions/goalsActions';
import { GoalCheckInModal } from '@/components/goals/GoalCheckInModal';
import { PriorityBadge } from '@/components/goals/PriorityBadge';
import { SubGoalsList } from '@/components/goals/SubGoalsList';
import { Plus, Trash2, History, Target, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight, Edit2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GoalsClientProps {
    initialGoals: Goal[];
    initialHistory: Goal[];
}

export function GoalsClient({ initialGoals, initialHistory }: GoalsClientProps) {
    const { currentTheme } = useTheme();
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [history, setHistory] = useState<Goal[]>(initialHistory);
    const [expiredGoal, setExpiredGoal] = useState<Goal | null>(null);

    // Goal creation state
    const [creatingPeriod, setCreatingPeriod] = useState<GoalPeriod | null>(null);
    const [newGoalText, setNewGoalText] = useState('');
    const [newGoalPriority, setNewGoalPriority] = useState<GoalPriority>('medium');
    const [newGoalNotes, setNewGoalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Goal viewing state
    const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

    // Initial check for expired goals
    useEffect(() => {
        const now = new Date();
        const expired = goals.find(g =>
            g.status === 'active' && new Date(g.end_date) < now
        );
        if (expired) {
            setExpiredGoal(expired);
        }
    }, [goals]);

    const handleCreateGoal = async (period: GoalPeriod) => {
        if (!newGoalText.trim()) {
            toast.error('Please enter a goal');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createGoal(period, newGoalText, newGoalPriority, newGoalNotes || undefined);
            if (result.success && result.goal) {
                toast.success('Goal created!');
                setGoals([...goals, result.goal]);
                setCreatingPeriod(null);
                setNewGoalText('');
                setNewGoalPriority('medium');
                setNewGoalNotes('');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to create goal');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const result = await deleteGoal(id);
            if (result.success) {
                toast.success('Goal deleted');
                setGoals(goals.filter(g => g.id !== id));
                router.refresh();
            }
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const handleGoalUpdate = () => {
        window.location.reload();
    };

    const handleProgressUpdate = async (goalId: string, percentage: number) => {
        const result = await updateGoalProgress(goalId, percentage);
        if (result.success) {
            setGoals(goals.map(g => g.id === goalId ? { ...g, progress_percentage: percentage } : g));
            toast.success('Progress updated');
        } else {
            toast.error(result.error || 'Failed to update progress');
        }
    };

    const handlePriorityChange = async (goalId: string, priority: GoalPriority) => {
        const result = await updateGoalPriority(goalId, priority);
        if (result.success) {
            setGoals(goals.map(g => g.id === goalId ? { ...g, priority } : g));
            toast.success('Priority updated');
        } else {
            toast.error(result.error || 'Failed to update priority');
        }
    };

    const handleAddSubGoal = async (goalId: string, text: string) => {
        const result = await addSubGoal(goalId, text);
        if (result.success && result.subGoal) {
            setGoals(goals.map(g =>
                g.id === goalId ? { ...g, sub_goals: [...g.sub_goals, result.subGoal!] } : g
            ));
            toast.success('Sub-goal added');
        } else {
            toast.error(result.error || 'Failed to add sub-goal');
        }
    };

    const handleToggleSubGoal = async (goalId: string, subGoalId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const updatedSubGoals = goal.sub_goals.map(sg =>
            sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
        );

        const result = await toggleSubGoal(goalId, subGoalId);
        if (result.success) {
            setGoals(goals.map(g =>
                g.id === goalId ? { ...g, sub_goals: updatedSubGoals } : g
            ));
        } else {
            toast.error(result.error || 'Failed to toggle sub-goal');
        }
    };

    const toggleExpanded = (goalId: string) => {
        const newExpanded = new Set(expandedGoals);
        if (newExpanded.has(goalId)) {
            newExpanded.delete(goalId);
        } else {
            newExpanded.add(goalId);
        }
        setExpandedGoals(newExpanded);
    };

    const getTimeRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} days left`;
        return `${hours} hours left`;
    };

    const getProgressPercentage = (startDate: string, endDate: string) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    const renderCard = (period: GoalPeriod) => {
        const activeGoals = goals.filter(g => g.period === period && g.status === 'active');
        const periodHistory = history.filter(g => g.period === period).slice(0, 3);
        const isCreating = creatingPeriod === period;
        const canAddMore = activeGoals.length < 10;

        const config = {
            '7d': {
                label: '7-Day Sprint',
                sublabel: 'Short-term focus',
                icon: Target,
                color: '#ec4899',
                placeholder: 'What must happen this week?',
            },
            '30d': {
                label: 'Monthly Milestone',
                sublabel: 'Building momentum',
                icon: CheckCircle2,
                color: '#8b5cf6',
                placeholder: 'Measurable outcome by month end?',
            },
            '365d': {
                label: 'Yearly Vision',
                sublabel: 'The north star',
                icon: ArrowRight,
                color: '#f59e0b',
                placeholder: 'Where in exactly one year?',
            }
        };

        const theme = config[period];

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
            >
                {/*category header card */}
                <div
                    className="relative overflow-hidden rounded-3xl border transition-all"
                    style={{
                        backgroundColor: `${currentTheme.colors.card}80`,
                        borderColor: activeGoals.length > 0 ? theme.color : currentTheme.colors.border,
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {activeGoals.length > 0 && (
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${theme.color}, transparent)` }} />
                    )}

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: activeGoals.length > 0 ? theme.color : currentTheme.colors.muted, color: '#fff' }}
                                >
                                    <theme.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium" style={{ color: currentTheme.colors.foreground }}>{theme.label}</h3>
                                    <span className="text-xs uppercase tracking-wider font-normal" style={{ color: currentTheme.colors.mutedForeground }}>{theme.sublabel} • {activeGoals.length}/10</span>
                                </div>
                            </div>
                            {canAddMore && !isCreating && (
                                <button
                                    onClick={() => setCreatingPeriod(period)}
                                    className="px-4 py-2 rounded-xl flex items-center gap-2 font-medium text-sm transition-all hover:scale-105"
                                    style={{ backgroundColor: theme.color, color: '#fff' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Goal
                                </button>
                            )}
                        </div>

                        {/* Create new goal form */}
                        {isCreating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: currentTheme.colors.background, borderColor: currentTheme.colors.border }}
                            >
                                <textarea
                                    autoFocus
                                    value={newGoalText}
                                    onChange={(e) => setNewGoalText(e.target.value)}
                                    placeholder={theme.placeholder}
                                    className="w-full bg-transparent resize-none outline-none text-sm font-normal mb-3 p-0"
                                    style={{ color: currentTheme.colors.foreground, minHeight: '60px' }}
                                />
                                <div className="flex gap-2 mb-3">
                                    {(['high', 'medium', 'low'] as GoalPriority[]).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setNewGoalPriority(p)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${newGoalPriority === p ? 'ring-2 ring-offset-1' : 'opacity-40 hover:opacity-70'}`}
                                            style={{ backgroundColor: p === 'high' ? '#ef4444' : p === 'medium' ? '#fb923c' : '#22c55e', color: '#fff' }}
                                        >
                                            {p.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setCreatingPeriod(null)} className="px-4 py-2 text-sm font-normal rounded-lg" style={{ color: currentTheme.colors.mutedForeground }}>Cancel</button>
                                    <button
                                        onClick={() => handleCreateGoal(period)}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm rounded-lg font-medium text-white"
                                        style={{ backgroundColor: theme.color }}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Goal'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Goals list */}
                        <div className="space-y-3">
                            {activeGoals.length === 0 && !isCreating && (
                                <div className="text-center py-8" style={{ color: currentTheme.colors.mutedForeground }}>
                                    <p className="text-sm font-normal">No active goals yet. Click "Add Goal" to start.</p>
                                </div>
                            )}
                            {activeGoals.map((goal, index) => {
                                const isExpanded = expandedGoals.has(goal.id);
                                const timeProgress = getProgressPercentage(goal.start_date, goal.end_date);
                                return (
                                    <motion.div
                                        key={goal.id}
                                        layout
                                        className="rounded-xl border overflow-hidden"
                                        style={{ backgroundColor: currentTheme.colors.card, borderColor: currentTheme.colors.border }}
                                    >
                                        <div
                                            className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                                            onClick={() => toggleExpanded(goal.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <PriorityBadge priority={goal.priority} size="sm" />
                                                        <span className="text-xs font-normal" style={{ color: currentTheme.colors.mutedForeground }}>
                                                            {getTimeRemaining(goal.end_date)}
                                                        </span>
                                                    </div>
                                                    <p className="font-lora text-[15px] leading-relaxed" style={{ color: currentTheme.colors.foreground }}>{goal.goal_text}</p>
                                                    {goal.sub_goals.length > 0 && (
                                                        <div className="mt-2 text-xs font-normal" style={{ color: currentTheme.colors.mutedForeground }}>
                                                            {goal.sub_goals.filter(sg => sg.completed).length}/{goal.sub_goals.length} sub-goals completed
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="p-1">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t px-4 pb-4"
                                                    style={{ borderColor: currentTheme.colors.border }}
                                                >
                                                    <div className="pt-4 space-y-4">
                                                        {/* Priority selector */}
                                                        <div>
                                                            <label className="text-xs font-medium mb-2 block uppercase tracking-wide" style={{ color: currentTheme.colors.mutedForeground }}>Priority</label>
                                                            <div className="flex gap-2">
                                                                {(['high', 'medium', 'low'] as GoalPriority[]).map(p => (
                                                                    <button
                                                                        key={p}
                                                                        onClick={() => handlePriorityChange(goal.id, p)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${goal.priority === p ? 'ring-2 ring-offset-1' : 'opacity-40 hover:opacity-70'}`}
                                                                        style={{ backgroundColor: p === 'high' ? '#ef4444' : p === 'medium' ? '#fb923c' : '#22c55e', color: '#fff' }}
                                                                    >
                                                                        {p.toUpperCase()}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Sub-goals */}
                                                        <SubGoalsList
                                                            subGoals={goal.sub_goals}
                                                            onToggle={(subGoalId) => handleToggleSubGoal(goal.id, subGoalId)}
                                                            onAdd={(text) => handleAddSubGoal(goal.id, text)}
                                                        />

                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                            className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete Goal
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* History */}
                {periodHistory.length > 0 && (
                    <div className="px-2 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-40">
                            <History className="w-3 h-3" />
                            Past Goals
                        </div>
                        {periodHistory.map((g) => (
                            <div
                                key={g.id}
                                className="p-3 rounded-xl border flex items-center justify-between gap-4"
                                style={{ backgroundColor: `${currentTheme.colors.card}40`, borderColor: currentTheme.colors.border }}
                            >
                                <span className="text-sm font-normal truncate flex-1" style={{ color: currentTheme.colors.foreground }}>{g.goal_text}</span>
                                <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${g.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {g.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="mb-16 relative">
                <div className="absolute top-0 left-0 w-20 h-20 bg-primary/20 blur-[100px] rounded-full" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <h1 className="text-5xl font-bold tracking-tight mb-4" style={{ color: currentTheme.colors.foreground }}>
                        Accountability
                    </h1>
                    <p className="text-xl max-w-2xl leading-relaxed" style={{ color: currentTheme.colors.mutedForeground }}>
                        Ambition without deadlines is just dreaming. Set your targets, commit to the timeline, and hold yourself accountable.
                    </p>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
                {renderCard('7d')}
                {renderCard('30d')}
                {renderCard('365d')}
            </div>

            {expiredGoal && (
                <GoalCheckInModal
                    goal={expiredGoal}
                    onClose={() => setExpiredGoal(null)}
                    onUpdate={handleGoalUpdate}
                />
            )}
        </div>
    );
}
