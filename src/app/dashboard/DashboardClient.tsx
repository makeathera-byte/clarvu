'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { DashboardHeader, TodayOverview, CategoryPieChart, TodayTimeline, AISummaryCard } from '@/components/dashboard';
import { CreateTaskModal } from '@/components/tasks';
import { ActiveTimerModal } from '@/components/timer';
import { TodayEvents } from '@/components/calendar';
import { useTimerStore } from '@/lib/timer/useTimerStore';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { createTaskAction, startTaskAction, updateTaskAction } from '@/app/dashboard/actions';
import { cleanupDuplicateCategories } from '@/app/dashboard/actions/cleanupCategories';
import { getSuggestionsForUser, recordSuggestionUse, TaskSuggestion } from '@/app/tasks/suggestionsActions';
import {
    Timer as TimerIcon,
    Plus,
    Clock,
    Play,
    Eye,
    CheckCircle2,
    Circle,
    ChevronDown,
    Flag,
    Calendar,
    CalendarOff,
    MoreVertical
} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority: 'low' | 'medium' | 'high';
    is_scheduled: boolean;
}

interface CalendarEvent {
    id: string;
    external_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
}

interface DashboardClientProps {
    initialTasks: Task[];
    userName?: string | null;
    calendarEvents: CalendarEvent[];
    userTimezone?: string;
}

export function DashboardClient({
    initialTasks,
    userName,
    calendarEvents,
    userTimezone = 'UTC',
}: DashboardClientProps) {
    const { currentTheme } = useTheme();
    const { taskId: activeTaskId, openTimer } = useTimerStore();

    // Quick add form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [isTaskScheduled, setIsTaskScheduled] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [showPriorityMenu, setShowPriorityMenu] = useState<string | null>(null);
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [showQuickAddPriorityMenu, setShowQuickAddPriorityMenu] = useState(false);

    // Suggestions state
    const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Initialize task store from server data
    const taskStore = useTaskStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && initialTasks.length > 0) {
            taskStore.setFromServer(initialTasks as any);
            isInitialized.current = true;
        }
    }, [initialTasks, taskStore]);

    // Auto-cleanup duplicate categories on mount
    useEffect(() => {
        cleanupDuplicateCategories().then((result) => {
            if (result.deleted > 0) {
                console.log(`Cleaned up ${result.deleted} duplicate categories`);
                window.location.reload();
            }
        });
    }, []);

    // Set default time in user's timezone
    useEffect(() => {
        const now = new Date();
        const tzNow = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
        setNewTaskTime(`${tzNow.getHours().toString().padStart(2, '0')}:${tzNow.getMinutes().toString().padStart(2, '0')}`);
    }, [userTimezone]);

    // Close category picker and priority menu on outside click
    const quickAddPriorityRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setShowCategoryPicker(false);
            }
            // Close priority menu if clicking outside
            const target = e.target as HTMLElement;
            if (!target.closest('[data-priority-menu]')) {
                setShowPriorityMenu(null);
            }
            // Close quick add priority menu if clicking outside
            if (quickAddPriorityRef.current && !quickAddPriorityRef.current.contains(e.target as Node)) {
                setShowQuickAddPriorityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Fetch suggestions when title changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (newTaskTitle.trim().length > 0) {
                const result = await getSuggestionsForUser(newTaskTitle, newTaskCategory || undefined);
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
    }, [newTaskTitle, newTaskCategory]);

    // Use tasks from store (auto-updates via realtime)
    const tasks = taskStore.tasks.length > 0 ? taskStore.tasks : initialTasks;

    // Get categories from store (single source of truth)
    const categories = useCategoryStore((s) => s.categories);

    // Sort tasks: by status first, then by priority (high > medium > low)
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusOrder = { in_progress: 0, scheduled: 1, unscheduled: 2, completed: 3 };
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        
        // First sort by status
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        
        // Then sort by priority (within same status)
        const aPriority = (a as any).priority || 'medium';
        const bPriority = (b as any).priority || 'medium';
        return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
    });

    const getCategory = (id: string | null) => categories.find(c => c.id === id);
    const selectedCategory = getCategory(newTaskCategory);

    const formatTime = (iso: string | null) => {
        if (!iso) return '';
        return new Date(iso).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true,
            timeZone: userTimezone,
        });
    };

    const handleQuickAdd = async () => {
        if (!newTaskTitle.trim()) return;

        setIsAdding(true);
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // Create the start time properly in user's timezone
            const now = new Date();
            const [hours, minutes] = newTaskTime.split(':').map(Number);
            
            // Get current date in user's timezone
            const tzFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const tzParts = tzFormatter.formatToParts(now);
            const year = parseInt(tzParts.find(p => p.type === 'year')?.value || '0');
            const month = parseInt(tzParts.find(p => p.type === 'month')?.value || '0');
            const day = parseInt(tzParts.find(p => p.type === 'day')?.value || '0');
            
            // Create a date string representing the local time in user's timezone
            const localDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
            
            // Convert this local time to UTC
            // We'll create a date and use the timezone offset
            const tempDate = new Date(localDateStr);
            const utcTime = tempDate.getTime();
            
            // Get what this time would be interpreted as in the user's timezone vs UTC
            const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(tempDate.toLocaleString('en-US', { timeZone: userTimezone }));
            const offset = utcDate.getTime() - tzDate.getTime();
            
            // Apply the offset to get the correct UTC time
            const finalStartTime = new Date(utcTime - offset);
            
            // Optimistically add task to store immediately (before server response)
            const optimisticTask: any = {
                id: tempId,
                user_id: '', // Will be updated by server
                title: newTaskTitle.trim(),
                category_id: newTaskCategory,
                start_time: isTaskScheduled ? finalStartTime.toISOString() : null,
                status: isTaskScheduled ? (finalStartTime > now ? 'scheduled' : 'in_progress') : 'unscheduled',
                priority: newTaskPriority,
                is_scheduled: isTaskScheduled,
                duration_minutes: 30,
                created_at: new Date().toISOString(),
            };
            
            // Add optimistically to store for immediate UI update
            taskStore.addOrUpdate(optimisticTask);

            const result = await createTaskAction({
                title: newTaskTitle.trim(),
                categoryId: newTaskCategory,
                startTime: finalStartTime.toISOString(),
                priority: newTaskPriority,
                isScheduled: isTaskScheduled,
            });

            if (result.success && result.task) {
                // Remove optimistic task
                taskStore.remove(tempId);
                
                // Add the real task immediately (realtime will also update it, but this ensures instant UI)
                if (result.task.id) {
                    taskStore.addOrUpdate(result.task as any);
                }
                
                // Record suggestion use for auto-learning
                await recordSuggestionUse(newTaskTitle.trim(), newTaskCategory);

                // Only start timer if task is scheduled
                if (isTaskScheduled) {
                    const startResult = await startTaskAction(result.task.id);
                    if (startResult.success) {
                        openTimer(result.task.id, result.task.title, 30 * 60);
                    }
                }
                
                setNewTaskTitle('');
                setNewTaskCategory(null);
                setShowSuggestions(false);
                inputRef.current?.focus();
            } else {
                // Remove optimistic task on error
                taskStore.remove(tempId);
            }
        } catch (error) {
            // Remove optimistic task on error
            taskStore.remove(tempId);
            console.error('Error creating task:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleStartTask = async (task: Task) => {
        const result = await startTaskAction(task.id);
        if (result.success) {
            openTimer(task.id, task.title, 30 * 60);
        }
    };

    const handleToggleSchedule = async (task: Task) => {
        const currentScheduled = (task as any).is_scheduled !== false;
        const newScheduled = !currentScheduled;
        
        // If scheduling, set default time to now
        const startTime = newScheduled ? new Date().toISOString() : null;
        
        const result = await updateTaskAction({
            taskId: task.id,
            isScheduled: newScheduled,
            startTime,
        });
        
        if (result.success && result.task) {
            // Update task in store with server response
            taskStore.addOrUpdate(result.task as any);
        }
    };

    const handlePriorityChange = async (task: Task, priority: 'low' | 'medium' | 'high') => {
        const result = await updateTaskAction({
            taskId: task.id,
            priority,
        });
        
        if (result.success && result.task) {
            // Update task in store with server response
            taskStore.addOrUpdate(result.task as any);
            setShowPriorityMenu(null);
        }
    };

    return (
        <>
            <main className="pt-28 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-6xl mx-auto">
                    <DashboardHeader userName={userName} />

                    {/* ═══════════════════════════════════════════════════════════
                        MAIN TASK CARD - Clean, Minimal Design
                    ═══════════════════════════════════════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-2xl overflow-visible"
                        style={{
                            backgroundColor: currentTheme.colors.card,
                            border: `1px solid ${currentTheme.colors.border}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        }}
                    >
                        {/* Quick Add Row */}
                        <div
                            className="p-4 flex gap-3 items-center relative"
                            style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (!showSuggestions || suggestions.length === 0) {
                                        if (e.key === 'Enter') handleQuickAdd();
                                        return;
                                    }
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSelectedSuggestionIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0);
                                    } else if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const selected = suggestions[selectedSuggestionIndex];
                                        setNewTaskTitle(selected.text);
                                        if (selected.category_id) setNewTaskCategory(selected.category_id);
                                        setShowSuggestions(false);
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setShowSuggestions(false);
                                    }
                                }}
                                placeholder="Add a task and press Enter..."
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{ color: currentTheme.colors.foreground }}
                            />

                            {/* Suggestions dropdown - positioned below input, with distinct styling */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    className="absolute left-0 mt-1 rounded-xl border z-[200] max-h-60 overflow-y-auto"
                                    style={{
                                        top: '100%',
                                        width: 'calc(100% - 200px)',
                                        backgroundColor: `${currentTheme.colors.background}95`,
                                        borderColor: `${currentTheme.colors.primary}20`,
                                        boxShadow: `0 8px 32px ${currentTheme.colors.primary}10`,
                                        backdropFilter: 'blur(16px)',
                                    }}
                                    onClick={(e) => {
                                        // Close priority menu when clicking suggestions
                                        setShowQuickAddPriorityMenu(false);
                                    }}
                                >
                                    {/* Header */}
                                    <div
                                        className="px-3 py-2 border-b text-xs font-medium flex items-center gap-2"
                                        style={{
                                            borderColor: `${currentTheme.colors.primary}20`,
                                            color: currentTheme.colors.primary
                                        }}
                                    >
                                        <span>✨ Suggestions</span>
                                        <span className="opacity-50">({suggestions.length})</span>
                                    </div>

                                    {suggestions.map((suggestion, index) => {
                                        const category = categories.find(c => c.id === suggestion.category_id);
                                        const isSelected = index === selectedSuggestionIndex;

                                        return (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => {
                                                    setNewTaskTitle(suggestion.text);
                                                    if (suggestion.category_id) setNewTaskCategory(suggestion.category_id);
                                                    setShowSuggestions(false);
                                                    inputRef.current?.focus();
                                                }}
                                                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                                className="w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-all"
                                                style={{
                                                    backgroundColor: isSelected ? `${currentTheme.colors.primary}20` : 'transparent',
                                                    color: currentTheme.colors.foreground,
                                                    borderLeft: isSelected ? `3px solid ${currentTheme.colors.primary}` : '3px solid transparent',
                                                }}
                                            >
                                                {category && (
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                                                )}
                                                <span className="flex-1">{suggestion.text}</span>
                                                {suggestion.is_global && (
                                                    <span
                                                        className="text-xs px-1.5 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: `${currentTheme.colors.primary}15`,
                                                            color: currentTheme.colors.primary,
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}

                                    {/* Footer hint */}
                                    <div
                                        className="px-3 py-1.5 border-t text-xs"
                                        style={{
                                            borderColor: `${currentTheme.colors.primary}15`,
                                            color: currentTheme.colors.mutedForeground,
                                        }}
                                    >
                                        ↑↓ Navigate • Enter Select • Esc Close
                                    </div>
                                </div>
                            )}

                            {/* Schedule Toggle */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>
                                    Schedule
                                </span>
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsTaskScheduled(!isTaskScheduled)}
                                    className="relative w-11 h-6 rounded-full transition-colors"
                                    style={{
                                        backgroundColor: isTaskScheduled ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    }}
                                    title={isTaskScheduled ? 'Scheduled - Click to unschedule' : 'Unscheduled - Click to schedule'}
                                >
                                    <motion.div
                                        animate={{ x: isTaskScheduled ? 22 : 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                    />
                                </motion.button>
                            </div>

                            {/* Time - Only show when scheduled */}
                            {isTaskScheduled && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-1 shrink-0"
                                >
                                    <Clock className="w-4 h-4" style={{ color: currentTheme.colors.mutedForeground }} />
                                    <input
                                        type="time"
                                        value={newTaskTime}
                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                        className="bg-transparent outline-none text-sm w-20"
                                        style={{ color: currentTheme.colors.mutedForeground }}
                                    />
                                </motion.div>
                            )}

                            {/* Priority Picker */}
                            <div className="relative shrink-0 z-[250]" ref={quickAddPriorityRef}>
                                <button
                                    onClick={() => {
                                        setShowQuickAddPriorityMenu(!showQuickAddPriorityMenu);
                                        setShowSuggestions(false); // Close suggestions when opening priority
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                    }}
                                    title={`Priority: ${newTaskPriority}`}
                                >
                                    <Flag 
                                        className="w-4 h-4" 
                                        style={{ 
                                            color: newTaskPriority === 'high' ? '#ef4444' : 
                                                   newTaskPriority === 'medium' ? '#facc15' : '#3b82f6' 
                                        }} 
                                    />
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                
                                {/* Priority Menu */}
                                {showQuickAddPriorityMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 top-full mt-1 py-1 rounded-lg z-[250] min-w-32 shadow-lg"
                                        style={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {(['high', 'medium', 'low'] as const).map((p) => {
                                            const pColor = p === 'high' ? '#ef4444' : p === 'medium' ? '#facc15' : '#3b82f6';
                                            const pLabel = p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low';
                                            const isSelected = newTaskPriority === p;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNewTaskPriority(p);
                                                        setShowQuickAddPriorityMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                    style={{
                                                        backgroundColor: isSelected ? `${pColor}10` : 'transparent',
                                                        color: currentTheme.colors.foreground,
                                                    }}
                                                >
                                                    <Flag className="w-4 h-4" style={{ color: pColor }} />
                                                    <span>{pLabel}</span>
                                                    {isSelected && <span className="ml-auto text-xs">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>

                            {/* Category Picker */}
                            <div className="relative z-[240]" ref={categoryRef}>
                                <button
                                    onClick={() => {
                                        setShowCategoryPicker(!showCategoryPicker);
                                        setShowQuickAddPriorityMenu(false); // Close priority when opening category
                                        setShowSuggestions(false); // Close suggestions when opening category
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                    style={{
                                        backgroundColor: selectedCategory ? `${selectedCategory.color}15` : currentTheme.colors.muted,
                                        color: selectedCategory ? selectedCategory.color : currentTheme.colors.mutedForeground,
                                    }}
                                >
                                    {selectedCategory ? (
                                        <>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                                            {selectedCategory.name}
                                        </>
                                    ) : (
                                        'Category'
                                    )}
                                    <ChevronDown className="w-3 h-3" />
                                </button>

                                {showCategoryPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-full right-0 mt-1 py-1 rounded-lg z-[100] min-w-32"
                                        style={{
                                            backgroundColor: currentTheme.colors.card,
                                            border: `1px solid ${currentTheme.colors.border}`,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        }}
                                    >
                                        <button
                                            onClick={() => { setNewTaskCategory(null); setShowCategoryPicker(false); }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 transition-colors"
                                            style={{ color: currentTheme.colors.mutedForeground }}
                                        >
                                            None
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setNewTaskCategory(cat.id); setShowCategoryPicker(false); }}
                                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                style={{ color: currentTheme.colors.foreground }}
                                            >
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                {cat.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Add Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleQuickAdd}
                                disabled={isAdding || !newTaskTitle.trim()}
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: newTaskTitle.trim() ? currentTheme.colors.primary : currentTheme.colors.muted,
                                    color: newTaskTitle.trim() ? currentTheme.colors.primaryForeground : currentTheme.colors.mutedForeground,
                                }}
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Task List */}
                        <div className="divide-y" style={{ borderColor: currentTheme.colors.border }}>
                            {sortedTasks.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Circle className="w-10 h-10 mx-auto mb-3" style={{ color: currentTheme.colors.muted }} />
                                    <p className="text-sm" style={{ color: currentTheme.colors.mutedForeground }}>
                                        No tasks yet. Add one above!
                                    </p>
                                </div>
                            ) : (
                                sortedTasks.map((task) => {
                                    const cat = getCategory((task as any).category_id);
                                    const isActive = activeTaskId === task.id;
                                    const isCompleted = task.status === 'completed';
                                    const isInProgress = task.status === 'in_progress';
                                    const isUnscheduled = task.status === 'unscheduled' || (!(task as any).is_scheduled && !(task as any).start_time);
                                    const priority = (task as any).priority || 'medium';

                                    // Priority colors and icons
                                    const priorityConfig = {
                                        high: { color: '#ef4444', icon: Flag, label: 'High' }, // Red Flag
                                        medium: { color: '#facc15', icon: Flag, label: 'Medium' }, // Yellow Flag
                                        low: { color: '#3b82f6', icon: Flag, label: 'Low' }, // Blue Flag
                                    };
                                    const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group flex items-center gap-4 px-4 py-3 hover:bg-black/[0.02] transition-colors"
                                            style={{
                                                backgroundColor: isActive ? `${currentTheme.colors.primary}05` : 'transparent',
                                            }}
                                        >
                                            {/* Status */}
                                            <div className="shrink-0">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                                                ) : isInProgress ? (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.15, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                        style={{ borderColor: currentTheme.colors.accent }}
                                                    >
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.accent }} />
                                                    </motion.div>
                                                ) : (
                                                    <Circle className="w-5 h-5" style={{ color: currentTheme.colors.border }} />
                                                )}
                                            </div>

                                            {/* Priority Indicator - Clickable */}
                                            <div className="relative shrink-0" data-priority-menu>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowPriorityMenu(showPriorityMenu === task.id ? null : task.id);
                                                    }}
                                                    className="p-1 rounded hover:bg-black/5 transition-colors"
                                                    title={`Priority: ${priorityInfo.label} (Click to change)`}
                                                >
                                                    <priorityInfo.icon 
                                                        className="w-4 h-4" 
                                                        style={{ color: priorityInfo.color, opacity: priority === 'high' ? 1 : priority === 'medium' ? 0.8 : 0.6 }}
                                                    />
                                                </button>
                                                
                                                {/* Priority Menu */}
                                                {showPriorityMenu === task.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="absolute left-0 top-full mt-1 py-1 rounded-lg z-[100] min-w-32 shadow-lg"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.card,
                                                            border: `1px solid ${currentTheme.colors.border}`,
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {(['high', 'medium', 'low'] as const).map((p) => {
                                                            const pConfig = priorityConfig[p];
                                                            const isSelected = priority === p;
                                                            return (
                                                                <button
                                                                    key={p}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePriorityChange(task as any, p);
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/5 transition-colors"
                                                                    style={{
                                                                        backgroundColor: isSelected ? `${pConfig.color}10` : 'transparent',
                                                                        color: currentTheme.colors.foreground,
                                                                    }}
                                                                >
                                                                    <pConfig.icon className="w-4 h-4" style={{ color: pConfig.color }} />
                                                                    <span>{pConfig.label}</span>
                                                                    {isSelected && <span className="ml-auto text-xs">✓</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <span
                                                className={`flex-1 text-sm ${isCompleted ? 'line-through' : ''}`}
                                                style={{ color: isCompleted ? currentTheme.colors.mutedForeground : currentTheme.colors.foreground }}
                                            >
                                                {task.title}
                                                {isUnscheduled && (
                                                    <span className="ml-2 text-xs opacity-60" style={{ color: currentTheme.colors.mutedForeground }}>
                                                        (Backlog)
                                                    </span>
                                                )}
                                            </span>

                                            {/* Category */}
                                            {cat && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs"
                                                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                                >
                                                    {cat.name}
                                                </span>
                                            )}

                                            {/* Time */}
                                            {(task as any).start_time && (
                                                <span className="text-xs shrink-0" style={{ color: currentTheme.colors.mutedForeground }}>
                                                    {formatTime((task as any).start_time)}
                                                </span>
                                            )}

                                            {/* Actions */}
                                            {!isCompleted && (
                                                <div className="flex items-center gap-1">
                                                    {/* Schedule Toggle - Always visible */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleSchedule(task as any);
                                                        }}
                                                        className="p-1.5 rounded-md transition-opacity group-hover:opacity-100 opacity-70"
                                                        style={{
                                                            backgroundColor: isUnscheduled ? currentTheme.colors.muted : `${currentTheme.colors.primary}20`,
                                                            color: isUnscheduled ? currentTheme.colors.mutedForeground : currentTheme.colors.primary,
                                                        }}
                                                        title={isUnscheduled ? 'Schedule this task' : 'Move to backlog'}
                                                    >
                                                        {isUnscheduled ? (
                                                            <CalendarOff className="w-3 h-3" />
                                                        ) : (
                                                            <Calendar className="w-3 h-3" />
                                                        )}
                                                    </motion.button>
                                                    
                                                    {/* Start/View Button */}
                                                    {task.status === 'scheduled' || isUnscheduled ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStartTask(task as any);
                                                            }}
                                                            className="p-1.5 rounded-md"
                                                            style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}
                                                            title={isUnscheduled ? 'Start from backlog' : 'Start task'}
                                                        >
                                                            <Play className="w-3 h-3" />
                                                        </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openTimer(task.id, task.title, 30 * 60);
                                                            }}
                                                            className="p-1.5 rounded-md"
                                                            style={{ backgroundColor: currentTheme.colors.accent, color: '#fff' }}
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* Active Timer Banner */}
                    {activeTaskId && (
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => openTimer(activeTaskId, '', 30 * 60)}
                            className="w-full mb-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                            style={{
                                backgroundColor: `${currentTheme.colors.accent}10`,
                                color: currentTheme.colors.accent,
                                border: `1px solid ${currentTheme.colors.accent}30`,
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            >
                                <TimerIcon className="w-4 h-4" />
                            </motion.div>
                            View Active Timer
                        </motion.button>
                    )}

                    <TodayOverview tasks={tasks as any} categories={categories} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid lg:grid-cols-2 gap-6 mb-8"
                    >
                        {/* Left Column: Category + Calendar stacked */}
                        <div className="space-y-4">
                            <CategoryPieChart tasks={tasks as any} categories={categories} />
                            <TodayEvents events={calendarEvents} />
                        </div>
                        {/* Right Column: Timeline */}
                        <TodayTimeline tasks={tasks as any} categories={categories} />
                    </motion.div>

                    {/* AI Summary - At the bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <AISummaryCard />
                    </motion.div>
                </div>
            </main>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <ActiveTimerModal />
        </>
    );
}
