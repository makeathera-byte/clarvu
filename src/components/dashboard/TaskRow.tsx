'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, useDragControls, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
    Play, Eye, CheckCircle2, Circle, Flag, Calendar, CalendarOff,
    GripVertical, Trash2, Pencil, Check, X, MoreVertical, Timer, Pause, Square
} from 'lucide-react';
import { useTimerStore, formatTimeWithHours } from '@/lib/timer/useTimerStore';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    priority?: 'low' | 'medium' | 'high';
    is_scheduled?: boolean;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface TaskRowProps {
    task: Task;
    activeTaskId: string | null;
    categories: Category[];
    onStart: (task: Task) => void;
    onToggleComplete: (task: Task) => void;
    onToggleSchedule: (task: Task) => void;
    onOpenEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onPriorityChange: (task: Task, priority: 'low' | 'medium' | 'high') => void;
    onStartCountUp?: (task: Task) => void;
    onDragStart: () => void;
    onDragEnd: (info: any, task: Task) => void;
    showMenuId: string | null;
    onSetShowMenu: (id: string | null) => void;
    showPriorityMenuId: string | null;
    onSetShowPriorityMenu: (id: string | null) => void;
    // Inline time entry props
    showTimeEntry?: boolean;
    onSubmitTime?: (task: Task, minutes: number) => void;
    onCancelTimeEntry?: (task: Task) => void;
    recentCustomTimes?: number[];
}

export function TaskRow({
    task,
    activeTaskId,
    categories,
    onStart,
    onToggleComplete,
    onToggleSchedule,
    onOpenEdit,
    onDelete,
    onPriorityChange,
    onStartCountUp,
    onDragStart,
    onDragEnd,
    showMenuId,
    onSetShowMenu,
    showPriorityMenuId,
    onSetShowPriorityMenu,
    showTimeEntry = false,
    onSubmitTime,
    onCancelTimeEntry,
    recentCustomTimes = [],
}: TaskRowProps) {
    const { currentTheme } = useTheme();
    const dragControls = useDragControls();

    const cat = categories.find(c => c.id === task.category_id);
    const isActive = activeTaskId === task.id;
    const isCompleted = task.status === 'completed';
    const isInProgress = task.status === 'in_progress';
    const isUnscheduled = task.status === 'unscheduled' || (!task.is_scheduled && !task.start_time);
    const priority = task.priority || 'medium';

    const priorityConfig = {
        high: { color: '#ef4444', icon: Flag, label: 'High' },
        medium: { color: '#facc15', icon: Flag, label: 'Medium' },
        low: { color: '#3b82f6', icon: Flag, label: 'Low' },
    };
    const priorityInfo = priorityConfig[priority];

    // Check if this task has an active count-up timer
    const {
        taskCountUpId,
        taskCountUpSeconds,
        taskCountUpIsRunning,
        incrementTaskCountUp,
        pauseTaskCountUp,
        resumeTaskCountUp,
    } = useTimerStore();

    const hasActiveCountUp = taskCountUpId === task.id;

    // Count-up timer interval
    useEffect(() => {
        if (!hasActiveCountUp || !taskCountUpIsRunning) return;

        const interval = setInterval(() => {
            incrementTaskCountUp();
        }, 1000);

        return () => clearInterval(interval);
    }, [hasActiveCountUp, taskCountUpIsRunning, incrementTaskCountUp]);

    // State for custom time entry
    const [customTimeValue, setCustomTimeValue] = useState('');

    return (
        <Reorder.Item
            value={task}
            drag // Enable free dragging (both axes)
            dragListener={false} // Disable default drag to prevent conflicts with buttons
            dragControls={dragControls}
            onDragStart={onDragStart}
            onDragEnd={(event: any, info) => {
                const point = info.point || { x: event.clientX, y: event.clientY };
                onDragEnd({ ...info, point }, task);
            }}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] cursor-default"
            style={{
                backgroundColor: isActive ? `${currentTheme.colors.primary}05` : currentTheme.colors.card,
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            whileDrag={{
                scale: 1.02,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                zIndex: 9999,
                cursor: 'grabbing',
            }}
        >
            {/* Drag Handle */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing p-1 -ml-1"
                style={{ color: currentTheme.colors.mutedForeground, touchAction: 'none' }}
            >
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Checkbox */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task);
                }}
                className="shrink-0 hover:scale-110 transition-transform"
                title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
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
            </button>

            {/* Priority Menu */}
            <div className="relative shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSetShowPriorityMenu(showPriorityMenuId === task.id ? null : task.id);
                        onSetShowMenu(null); // Close other menu
                    }}
                    className="p-1 rounded-md hover:bg-black/5 flex items-center gap-1"
                >
                    <Flag className="w-3.5 h-3.5" style={{ color: priorityInfo.color }} />
                </button>

                <AnimatePresence>
                    {showPriorityMenuId === task.id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full left-0 mt-1 z-[100] rounded-xl border p-1 shadow-xl min-w-[120px]"
                            style={{
                                backgroundColor: currentTheme.colors.card,
                                borderColor: currentTheme.colors.border
                            }}
                        >
                            {(['high', 'medium', 'low'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPriorityChange(task, p);
                                        onSetShowPriorityMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-black/5 text-left"
                                >
                                    <Flag className="w-3 h-3" style={{ color: priorityConfig[p].color }} />
                                    <span>{priorityConfig[p].label}</span>
                                    {priority === p && <Check className="w-3 h-3 ml-auto" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Inline Time Entry UI - shows when completing task without timer */}
            {showTimeEntry ? (
                <div className="flex-1 min-w-0">
                    <div
                        className="flex flex-col gap-2 p-2 rounded-lg"
                        style={{ backgroundColor: `${currentTheme.colors.primary}08` }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium" style={{ color: currentTheme.colors.mutedForeground }}>
                                How long did this take?
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancelTimeEntry?.(task);
                                }}
                                className="ml-auto p-1 rounded hover:bg-black/10"
                            >
                                <X className="w-3 h-3" style={{ color: currentTheme.colors.mutedForeground }} />
                            </button>
                        </div>

                        {/* Preset time buttons */}
                        <div className="flex flex-wrap gap-1">
                            {[5, 10, 15, 25, 30].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSubmitTime?.(task, mins);
                                    }}
                                    className="px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: currentTheme.colors.muted,
                                        color: currentTheme.colors.foreground,
                                    }}
                                >
                                    {mins}m
                                </button>
                            ))}

                            {/* Recent custom times if any */}
                            {recentCustomTimes.filter(t => ![5, 10, 15, 25, 30].includes(t)).slice(0, 3).map((mins) => (
                                <button
                                    key={`recent-${mins}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSubmitTime?.(task, mins);
                                    }}
                                    className="px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.accent}20`,
                                        color: currentTheme.colors.accent,
                                    }}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>

                        {/* Custom time input */}
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                placeholder="Custom"
                                value={customTimeValue}
                                onChange={(e) => setCustomTimeValue(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 px-2 py-1 rounded-md text-xs text-center outline-none"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                }}
                                min="1"
                                max="480"
                            />
                            <span className="text-xs" style={{ color: currentTheme.colors.mutedForeground }}>min</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const mins = parseInt(customTimeValue);
                                    if (mins > 0) {
                                        onSubmitTime?.(task, mins);
                                        setCustomTimeValue('');
                                    }
                                }}
                                disabled={!customTimeValue || parseInt(customTimeValue) <= 0}
                                className="px-2 py-1 rounded-md text-xs font-medium disabled:opacity-50"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                }}
                            >
                                <Check className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSubmitTime?.(task, 0); // Skip - complete without time
                                }}
                                className="px-2 py-1 rounded-md text-xs"
                                style={{ color: currentTheme.colors.mutedForeground }}
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Task Content */
                <div
                    className="flex-1 min-w-0 flex flex-col gap-0.5 cursor-pointer"
                    onClick={(e) => {
                        // e.stopPropagation(); // Allow row click? Maybe for selection?
                        // Original didn't have row click action, but let's allow starting task on click?
                        // Previous code had: onClick={() => handleStartTask(task as any)} on the div
                        // We should probably keep it if that was desired, but maybe interfere with drag?
                        // With dragListener=false, clicks work fine.
                        onStart(task);
                    }}
                >
                    <span
                        className={`text-sm truncate ${isCompleted ? 'line-through opacity-50' : ''}`}
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                        {cat && (
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-black/5" style={{ backgroundColor: `${cat.color}15` }}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-[10px] font-medium" style={{ color: cat.color }}>
                                    {cat.name}
                                </span>
                            </div>
                        )}
                        {hasActiveCountUp && (
                            <div
                                className="flex items-center gap-2 px-3 py-1 rounded-lg animate-pulse"
                                style={{
                                    backgroundColor: `${currentTheme.colors.primary}20`,
                                    border: `1px solid ${currentTheme.colors.primary}40`,
                                }}
                            >
                                <Timer className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                                <span className="text-sm font-mono font-bold" style={{ color: currentTheme.colors.primary }}>
                                    {formatTimeWithHours(taskCountUpSeconds)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (taskCountUpIsRunning) {
                                            pauseTaskCountUp();
                                        } else {
                                            resumeTaskCountUp();
                                        }
                                    }}
                                    className="p-1 rounded-md hover:bg-white/20"
                                    style={{ backgroundColor: `${currentTheme.colors.primary}30` }}
                                >
                                    {taskCountUpIsRunning ? (
                                        <Pause className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                                    ) : (
                                        <Play className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions (Hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isUnscheduled || task.status === 'scheduled' ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart(task); }}
                        className="p-1.5 rounded-md"
                        style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}
                    >
                        <Play className="w-3.5 h-3.5" />
                    </button>
                ) : null}

                {/* More Menu */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSetShowMenu(showMenuId === task.id ? null : task.id);
                            onSetShowPriorityMenu(null);
                        }}
                        className="p-1.5 rounded-md hover:bg-black/5"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                        {showMenuId === task.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-full right-0 mt-1 z-[100] rounded-xl border p-1 shadow-xl min-w-[120px]"
                                style={{
                                    backgroundColor: currentTheme.colors.card,
                                    borderColor: currentTheme.colors.border
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenEdit(task);
                                        onSetShowMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-black/5 text-left"
                                >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSchedule(task);
                                        onSetShowMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-black/5 text-left"
                                >
                                    {isUnscheduled ? <Calendar className="w-3 h-3" /> : <CalendarOff className="w-3 h-3" />}
                                    <span>{isUnscheduled ? 'Schedule' : 'Unschedule'}</span>
                                </button>
                                {onStartCountUp && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartCountUp(task);
                                            onSetShowMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-black/5 text-left"
                                    >
                                        <Timer className="w-3 h-3" />
                                        <span>Start Count Up</span>
                                    </button>
                                )}
                                <div className="h-px bg-black/10 my-1" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete task?')) onDelete(task.id);
                                        onSetShowMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-red-50 text-red-500 text-left"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Reorder.Item >
    );
}
