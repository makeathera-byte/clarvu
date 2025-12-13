'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Goal, GoalPeriod, createGoal, deleteGoal } from './actions/goalsActions';
import { GoalCheckInModal } from '@/components/goals/GoalCheckInModal';
import { Plus, Trash2, History, Target, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const result = await createGoal(period, newGoalText);
            if (result.success && result.goal) {
                toast.success('Goal set committed!');
                setGoals([...goals, result.goal]);
                setCreatingPeriod(null);
                setNewGoalText('');
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
        const activeGoal = goals.find(g => g.period === period && g.status === 'active');
        const periodHistory = history.filter(g => g.period === period).slice(0, 3);
        const isCreating = creatingPeriod === period;

        const config = {
            '7d': {
                label: '7-Day Sprint',
                sublabel: 'Short-term focus',
                icon: Target,
                color: '#ec4899', // Pink
                placeholder: 'What is the ONE thing that must happen this week?',
            },
            '30d': {
                label: 'Monthly Milestone',
                sublabel: 'Building momentum',
                icon: CheckCircle2,
                color: '#8b5cf6', // Purple
                placeholder: 'What measurable outcome do you want by month end?',
            },
            '365d': {
                label: 'Yearly Vision',
                sublabel: 'The north star',
                icon: ArrowRight,
                color: '#f59e0b', // Amber
                placeholder: 'Where do you want to be in exactly one year?',
            }
        };

        const theme = config[period];
        const progress = activeGoal ? getProgressPercentage(activeGoal.start_date, activeGoal.end_date) : 0;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
            >
                {/* Main Card */}
                <div
                    className="relative overflow-hidden rounded-3xl border transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/5"
                    style={{
                        backgroundColor: `${currentTheme.colors.card}80`, // Glassy
                        borderColor: activeGoal ? theme.color : currentTheme.colors.border,
                        backdropFilter: 'blur(12px)',
                        boxShadow: activeGoal ? `0 10px 40px -10px ${theme.color}20` : 'none',
                    }}
                >
                    {/* Active Goal Glow */}
                    {activeGoal && (
                        <div
                            className="absolute top-0 left-0 w-full h-1"
                            style={{
                                background: `linear-gradient(90deg, ${theme.color}, transparent)`
                            }}
                        />
                    )}

                    <div className="p-8 min-h-[380px] flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                                    style={{
                                        backgroundColor: activeGoal ? theme.color : currentTheme.colors.muted,
                                        color: activeGoal ? '#fff' : currentTheme.colors.mutedForeground
                                    }}
                                >
                                    <theme.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight" style={{ color: currentTheme.colors.foreground }}>
                                        {theme.label}
                                    </h3>
                                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: currentTheme.colors.mutedForeground }}>
                                        {theme.sublabel}
                                    </span>
                                </div>
                            </div>

                            {activeGoal && (
                                <div
                                    className="px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.background}80`,
                                        borderColor: currentTheme.colors.border,
                                        color: currentTheme.colors.foreground
                                    }}
                                >
                                    <Clock className="w-3 h-3" />
                                    {getTimeRemaining(activeGoal.end_date)}
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col relative z-10">
                            <AnimatePresence mode="wait">
                                {activeGoal ? (
                                    <motion.div
                                        key="active"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <p className="text-2xl font-serif leading-relaxed flex-1" style={{ color: currentTheme.colors.foreground }}>
                                            "{activeGoal.goal_text}"
                                        </p>

                                        <div className="mt-8 space-y-3">
                                            <div className="flex justify-between text-xs font-medium opacity-70">
                                                <span>Progress</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={() => handleDeleteGoal(activeGoal.id)}
                                                    className="p-2 hover:bg-black/5 rounded-lg transition-colors text-red-500 opacity-0 group-hover:opacity-100"
                                                    title="Give up (Delete)"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : isCreating ? (
                                    <motion.div
                                        key="creating"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <textarea
                                            autoFocus
                                            value={newGoalText}
                                            onChange={(e) => setNewGoalText(e.target.value)}
                                            placeholder={theme.placeholder}
                                            className="w-full flex-1 bg-transparent resize-none outline-none text-xl placeholder:opacity-40 p-0 font-medium"
                                            style={{ color: currentTheme.colors.foreground }}
                                        />
                                        <div className="flex gap-3 justify-end mt-4">
                                            <button
                                                onClick={() => setCreatingPeriod(null)}
                                                className="px-4 py-2 text-sm rounded-xl font-medium transition-colors hover:bg-black/5"
                                                style={{ color: currentTheme.colors.mutedForeground }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleCreateGoal(period)}
                                                disabled={isSubmitting}
                                                className="px-6 py-2 text-sm rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all"
                                                style={{ backgroundColor: theme.color }}
                                            >
                                                {isSubmitting ? 'Committing...' : 'Commit Goal'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer group/empty"
                                        onClick={() => setCreatingPeriod(period)}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 group-hover/empty:scale-110 group-hover/empty:border-solid mb-4"
                                            style={{ borderColor: currentTheme.colors.border }}
                                        >
                                            <Plus className="w-6 h-6 transition-transform group-hover/empty:rotate-90" style={{ color: currentTheme.colors.mutedForeground }} />
                                        </div>
                                        <h4 className="font-semibold text-lg mb-1" style={{ color: currentTheme.colors.foreground }}>Set {theme.label}</h4>
                                        <p className="text-sm max-w-[200px]" style={{ color: currentTheme.colors.mutedForeground }}>
                                            Define a clear objective to focus your efforts.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="px-2">
                    {periodHistory.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 px-2">
                                <History className="w-3 h-3" />
                                Past Sprints
                            </div>
                            {periodHistory.map((g, i) => (
                                <motion.div
                                    key={g.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 rounded-xl border flex items-center justify-between gap-4 group/history hover:translate-x-1 transition-all duration-300"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.card}40`,
                                        borderColor: currentTheme.colors.border
                                    }}
                                >
                                    <span className="text-sm font-medium truncate flex-1 opacity-70 group-hover/history:opacity-100 transition-opacity" style={{ color: currentTheme.colors.foreground }}>
                                        {g.goal_text}
                                    </span>
                                    {g.status === 'completed' ? (
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        </div>
                                    ) : (
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
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
