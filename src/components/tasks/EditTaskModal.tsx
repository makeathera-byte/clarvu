'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { X, Flag } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'unscheduled';
    category_id: string | null;
    priority: 'low' | 'medium' | 'high';
}

interface EditTaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskId: string, updates: { title: string; categoryId: string | null; priority: 'low' | 'medium' | 'high' }) => void;
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
    const { currentTheme } = useTheme();
    const { categories } = useCategoryStore();

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    // Initialize form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setCategoryId(task.category_id);
            setPriority(task.priority || 'medium');
        }
    }, [task]);

    const handleSave = () => {
        if (!task || !title.trim()) return;
        onSave(task.id, {
            title: title.trim(),
            categoryId,
            priority,
        });
        onClose();
    };

    const priorityConfig = {
        high: { color: '#ef4444', label: 'High' },
        medium: { color: '#facc15', label: 'Medium' },
        low: { color: '#3b82f6', label: 'Low' },
    };

    if (!isOpen || !task) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-xl overflow-hidden"
                    style={{
                        backgroundColor: currentTheme.colors.card,
                        border: `1px solid ${currentTheme.colors.border}`,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-5 py-4 flex items-center justify-between"
                        style={{ borderBottom: `1px solid ${currentTheme.colors.border}` }}
                    >
                        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.foreground }}>
                            Edit Task
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-black/5 transition-colors"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Task Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                }}
                                autoFocus
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Category
                            </label>
                            <select
                                value={categoryId || ''}
                                onChange={(e) => setCategoryId(e.target.value || null)}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                    border: `1px solid ${currentTheme.colors.border}`,
                                }}
                            >
                                <option value="">No Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.foreground }}>
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map((p) => {
                                    const config = priorityConfig[p];
                                    const isSelected = priority === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                            style={{
                                                backgroundColor: isSelected ? `${config.color}20` : currentTheme.colors.muted,
                                                color: isSelected ? config.color : currentTheme.colors.mutedForeground,
                                                border: `2px solid ${isSelected ? config.color : 'transparent'}`,
                                            }}
                                        >
                                            <Flag className="w-4 h-4" style={{ color: config.color }} />
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="px-5 py-4 flex justify-end gap-3"
                        style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}
                    >
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: currentTheme.colors.muted,
                                color: currentTheme.colors.foreground,
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: currentTheme.colors.primary,
                                color: currentTheme.colors.primaryForeground,
                                opacity: title.trim() ? 1 : 0.5,
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
