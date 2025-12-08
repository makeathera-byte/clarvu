'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { createTaskAction, startTaskAction } from '@/app/dashboard/actions';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { Plus, Clock } from 'lucide-react';

export function QuickTaskBar() {
    const { currentTheme } = useTheme();
    const categories = useCategoryStore((s) => s.categories);
    const { openTimer } = useTimerStore();

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Set default time to now
    useEffect(() => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        setStartTime(`${hours}:${minutes}`);
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt+1-6 for category selection
            if (e.altKey && e.key >= '1' && e.key <= '6') {
                const index = parseInt(e.key) - 1;
                if (categories[index]) {
                    setCategoryId(categoryId === categories[index].id ? null : categories[index].id);
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [categories, categoryId]);

    const handleSubmit = useCallback(async () => {
        if (!title.trim()) {
            setError('Enter a task name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Build full datetime from time input (today's date)
            const today = new Date();
            const [hours, minutes] = startTime.split(':').map(Number);
            today.setHours(hours, minutes, 0, 0);

            const result = await createTaskAction({
                title: title.trim(),
                categoryId,
                startTime: today.toISOString(),
                priority: 'medium', // Quick tasks default to medium priority
                isScheduled: true, // Quick tasks are always scheduled
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success && result.task) {
                // Start the task immediately
                const startResult = await startTaskAction(result.task.id);
                if (startResult.success) {
                    openTimer(result.task.id, result.task.title, 30 * 60);
                }

                // Reset form
                setTitle('');
                setCategoryId(null);
                inputRef.current?.focus();
            }
        } catch {
            setError('Failed to create task');
        } finally {
            setIsLoading(false);
        }
    }, [title, startTime, categoryId, openTimer]);

    // Handle enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const selectedCategory = categories.find(c => c.id === categoryId);

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            {/* Task Name Input */}
            <div className="flex-1 relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="What's next? Press Enter to create & start..."
                    className="w-full h-10 px-4 rounded-lg border outline-none transition-all text-sm"
                    style={{
                        backgroundColor: currentTheme.colors.muted,
                        color: currentTheme.colors.foreground,
                        borderColor: error ? '#ef4444' : 'transparent',
                    }}
                />
                {error && (
                    <span className="absolute -bottom-5 left-0 text-xs text-red-500">
                        {error}
                    </span>
                )}
            </div>

            {/* Time Input */}
            <div className="relative shrink-0">
                <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: currentTheme.colors.mutedForeground }}
                />
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 pl-9 pr-2 rounded-lg border outline-none text-sm w-24"
                    style={{
                        backgroundColor: currentTheme.colors.muted,
                        color: currentTheme.colors.foreground,
                        borderColor: 'transparent',
                    }}
                />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1 shrink-0 overflow-x-auto">
                {categories.slice(0, 6).map((cat, index) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                        className="h-10 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                        style={{
                            backgroundColor: categoryId === cat.id ? `${cat.color}20` : currentTheme.colors.muted,
                            color: categoryId === cat.id ? cat.color : currentTheme.colors.mutedForeground,
                            border: categoryId === cat.id ? `1px solid ${cat.color}` : '1px solid transparent',
                        }}
                        title={`Alt+${index + 1}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Create Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-10 px-4 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap shrink-0"
                style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.primaryForeground,
                }}
            >
                {isLoading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                ) : (
                    <>
                        <Plus className="w-4 h-4" />
                        Add
                    </>
                )}
            </motion.button>
        </div>
    );
}
