'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { Button } from '@/components/ui/button';
import { X, Clock, Tag, Flag } from 'lucide-react';
import { createTaskAction, startTaskAction } from '@/app/dashboard/actions';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { getSuggestionsForUser, recordSuggestionUse, TaskSuggestion } from '@/app/tasks/suggestionsActions';
import { SuggestionsList } from './SuggestionsList';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: Date;
    onTaskCreated?: () => void;
}

export function CreateTaskModal({ isOpen, onClose, initialDate, onTaskCreated }: CreateTaskModalProps) {
    const { currentTheme } = useTheme();
    const { startTaskTimer } = useTimerStore();
    // Use categories from global store (single source of truth)
    const categories = useCategoryStore((s) => s.categories);

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isScheduled, setIsScheduled] = useState(true);
    const [isTimeScheduled, setIsTimeScheduled] = useState(false); // Whether to schedule a specific time
    const [isLoading, setIsLoading] = useState(false);
    const [isStartingNow, setIsStartingNow] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [taskDate, setTaskDate] = useState<Date>(new Date()); // Store the date for the task
    const inputRef = useRef<HTMLInputElement>(null);

    // Suggestions state
    const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

    // Fetch suggestions when title changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (title.trim().length > 0) {
                console.log('Fetching suggestions for:', title);
                const result = await getSuggestionsForUser(title, categoryId || undefined);
                console.log('Suggestions result:', result);
                setSuggestions(result.suggestions || []);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 150);
        return () => clearTimeout(debounce);
    }, [title, categoryId]);

    // Debug: Log suggestions state changes
    useEffect(() => {
        console.log('Suggestions state changed:', {
            showSuggestions,
            suggestionsCount: suggestions.length,
            title,
            suggestions: suggestions.slice(0, 3) // Show first 3
        });
    }, [showSuggestions, suggestions, title]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setCategoryId(null);
            setStartTime('');
            setPriority('medium');
            setIsTimeScheduled(false); // Default to no specific time
            setError(null);
            setSuggestions([]);
            setShowSuggestions(false);
            // Set default time - use initialDate if provided, otherwise use current time
            const dateToUse = initialDate || new Date();
            setTaskDate(dateToUse); // Store the full date for use when creating the task
            const hours = dateToUse.getHours().toString().padStart(2, '0');
            const minutes = dateToUse.getMinutes().toString().padStart(2, '0');
            setStartTime(`${hours}:${minutes}`);
            // Autofocus with slight delay for animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialDate]);

    // Handle keyboard navigation for suggestions
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
        }
    };

    // Handle escape key to close modal
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showSuggestions) {
                onClose();
            }
            // Alt+1-6 for category selection
            if (isOpen && e.altKey && e.key >= '1' && e.key <= '6') {
                const index = parseInt(e.key) - 1;
                if (categories[index]) {
                    setCategoryId(categoryId === categories[index].id ? null : categories[index].id);
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose, categories, categoryId, showSuggestions]);

    const handleSubmit = useCallback(async (startNow: boolean) => {
        if (!title.trim()) {
            setError('Please enter a task title');
            return;
        }

        if (startNow) {
            setIsStartingNow(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            // Build full datetime from time input and the stored task date
            const taskDateTime = new Date(taskDate); // Use the date from when modal opened (clicked date)
            if (isTimeScheduled && startTime) {
                const [hours, minutes] = startTime.split(':').map(Number);
                taskDateTime.setHours(hours, minutes, 0, 0);
            } else {
                // If no specific time, set to start of day
                taskDateTime.setHours(0, 0, 0, 0);
            }

            const result = await createTaskAction({
                title: title.trim(),
                categoryId,
                startTime: taskDateTime.toISOString(),
                priority,
                isScheduled: true, // Always scheduled with a date
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success && result.task) {
                // Record suggestion use for auto-learning
                await recordSuggestionUse(title.trim(), categoryId);

                // If "Create & Start Now", start the timer immediately
                if (startNow) {
                    const startResult = await startTaskAction(result.task.id);
                    if (startResult.success) {
                        startTaskTimer(result.task.id, result.task.title, 30 * 60);
                    }
                }
                // Call onTaskCreated callback to refresh calendar
                if (onTaskCreated) {
                    await onTaskCreated();
                }
                onClose();
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
            setIsStartingNow(false);
        }
    }, [title, categoryId, startTime, isTimeScheduled, taskDate, onClose, startTaskTimer, onTaskCreated]);

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: TaskSuggestion) => {
        setTitle(suggestion.text);
        if (suggestion.category_id) {
            setCategoryId(suggestion.category_id);
        }
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    style={{ backgroundColor: `${currentTheme.colors.background}80` }}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md rounded-2xl border backdrop-blur-xl overflow-visible"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                        boxShadow: `0 25px 50px -12px ${currentTheme.colors.background}90`,
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-6 border-b"
                        style={{ borderColor: currentTheme.colors.border }}
                    >
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            Create New Task
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-xl"
                            style={{
                                color: currentTheme.colors.mutedForeground,
                                backgroundColor: currentTheme.colors.muted,
                            }}
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-5">
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl"
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                }}
                            >
                                <span className="text-sm" style={{ color: '#ef4444' }}>
                                    {error}
                                </span>
                            </motion.div>
                        )}

                        {/* Task Title */}
                        <div className="space-y-2 relative">
                            <label
                                className="block text-sm font-medium"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                Task Title
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What are you working on?"
                                className="w-full h-12 px-4 rounded-xl border-2 outline-none transition-all focus:border-current"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    borderColor: 'transparent',
                                }}
                            />

                            {/* Suggestions dropdown - SIMPLIFIED FOR DEBUGGING */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    className="absolute top-full left-0 right-0 mt-2 rounded-lg border p-2 z-[9999]"
                                    style={{
                                        backgroundColor: currentTheme.colors.card,
                                        borderColor: currentTheme.colors.border,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    <div className="text-xs mb-1" style={{ color: currentTheme.colors.mutedForeground }}>
                                        {suggestions.length} suggestions found
                                    </div>
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => handleSelectSuggestion(suggestion)}
                                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                            className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-opacity-10"
                                            style={{
                                                backgroundColor: index === selectedSuggestionIndex
                                                    ? `${currentTheme.colors.primary}20`
                                                    : 'transparent',
                                                color: currentTheme.colors.foreground,
                                            }}
                                        >
                                            {suggestion.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                            <label
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                <Tag className="w-4 h-4" />
                                Category
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((cat, index) => (
                                    <motion.button
                                        key={cat.id}
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm text-left transition-all"
                                        style={{
                                            borderColor: categoryId === cat.id ? cat.color : currentTheme.colors.border,
                                            backgroundColor: categoryId === cat.id
                                                ? `${cat.color}15`
                                                : 'transparent',
                                            color: currentTheme.colors.foreground,
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span className="truncate">{cat.name}</span>
                                        </div>
                                        <span
                                            className="text-xs"
                                            style={{ color: currentTheme.colors.mutedForeground }}
                                        >
                                            Alt+{index + 1}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Priority Selection */}
                        <div className="space-y-2">
                            <label
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                <Flag className="w-4 h-4" />
                                Priority
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setPriority('low')}
                                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all"
                                    style={{
                                        borderColor: priority === 'low' ? '#3b82f6' : currentTheme.colors.border,
                                        backgroundColor: priority === 'low' ? '#3b82f615' : 'transparent',
                                        color: currentTheme.colors.foreground,
                                    }}
                                >
                                    <Flag className="w-4 h-4" style={{ color: '#3b82f6' }} />
                                    <span className="text-sm">Low</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setPriority('medium')}
                                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all"
                                    style={{
                                        borderColor: priority === 'medium' ? '#facc15' : currentTheme.colors.border,
                                        backgroundColor: priority === 'medium' ? '#facc1515' : 'transparent',
                                        color: currentTheme.colors.foreground,
                                    }}
                                >
                                    <Flag className="w-4 h-4" style={{ color: '#facc15' }} />
                                    <span className="text-sm">Medium</span>
                                </motion.button>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setPriority('high')}
                                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all"
                                    style={{
                                        borderColor: priority === 'high' ? '#ef4444' : currentTheme.colors.border,
                                        backgroundColor: priority === 'high' ? '#ef444415' : 'transparent',
                                        color: currentTheme.colors.foreground,
                                    }}
                                >
                                    <Flag className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    <span className="text-sm">High</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Date Picker - Always visible */}
                        <div className="space-y-2">
                            <label
                                className="flex items-center gap-2 text-sm font-medium"
                                style={{ color: currentTheme.colors.foreground }}
                            >
                                <Clock className="w-4 h-4" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={taskDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    // Preserve the time from taskDate
                                    newDate.setHours(taskDate.getHours(), taskDate.getMinutes(), 0, 0);
                                    setTaskDate(newDate);
                                }}
                                className="w-full h-12 px-4 rounded-xl border-2 outline-none transition-all focus:border-current"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    borderColor: 'transparent',
                                }}
                            />
                        </div>

                        {/* Time Schedule Toggle */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    className="flex items-center gap-2 text-sm font-medium"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    <Clock className="w-4 h-4" />
                                    Schedule specific time
                                </label>
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsTimeScheduled(!isTimeScheduled)}
                                    className="relative w-12 h-6 rounded-full transition-colors"
                                    style={{
                                        backgroundColor: isTimeScheduled ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    }}
                                >
                                    <motion.div
                                        animate={{ x: isTimeScheduled ? 24 : 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                    />
                                </motion.button>
                            </div>
                            {!isTimeScheduled && (
                                <p className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Task will be scheduled for the date without a specific time
                                </p>
                            )}
                        </div>

                        {/* Time Input (only shown when time is scheduled) */}
                        {isTimeScheduled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label
                                    className="flex items-center gap-2 text-sm font-medium"
                                    style={{ color: currentTheme.colors.foreground }}
                                >
                                    <Clock className="w-4 h-4" />
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border-2 outline-none"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                        borderColor: 'transparent',
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-6 pt-0 flex gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                                onClick={() => handleSubmit(false)}
                                disabled={isLoading || isStartingNow}
                                className="w-full h-12 rounded-xl font-medium"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                }}
                            >
                                {isLoading ? 'Creating...' : 'Create Task'}
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                                onClick={() => handleSubmit(true)}
                                disabled={isLoading || isStartingNow}
                                className="w-full h-12 rounded-xl font-medium"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                    boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
                                }}
                            >
                                {isStartingNow ? 'Starting...' : 'Create & Start'}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
