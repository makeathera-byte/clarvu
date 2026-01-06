'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthlyFocusEditorProps {
    initialFocus: string;
    onSave: (focus: string) => Promise<void>;
    year: number;
    month: number;
}

/**
 * MonthlyFocusEditor - Inline editable monthly focus/theme field
 */
export function MonthlyFocusEditor({
    initialFocus,
    onSave,
    year,
    month
}: MonthlyFocusEditorProps) {
    const { currentTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [focus, setFocus] = useState(initialFocus);
    const [tempFocus, setTempFocus] = useState(initialFocus);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFocus(initialFocus);
        setTempFocus(initialFocus);
    }, [initialFocus]);

    const handleSave = async () => {
        if (tempFocus.trim() === focus.trim()) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(tempFocus.trim());
            setFocus(tempFocus.trim());
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save monthly focus:', error);
            // Revert on error
            setTempFocus(focus);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempFocus(focus);
        setIsEditing(false);
    };

    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: currentTheme.colors.mutedForeground }}
                >
                    {monthName}'s Focus
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        <textarea
                            value={tempFocus}
                            onChange={(e) => setTempFocus(e.target.value)}
                            placeholder="What's your main focus this month?"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: currentTheme.colors.background,
                                borderColor: currentTheme.colors.border,
                                color: currentTheme.colors.foreground,
                            }}
                            autoFocus
                            disabled={isSaving}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: currentTheme.colors.primary,
                                    color: currentTheme.colors.primaryForeground,
                                }}
                            >
                                <Check className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: currentTheme.colors.muted,
                                    color: currentTheme.colors.foreground,
                                }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setIsEditing(true)}
                        className="p-3 rounded-lg cursor-pointer hover:bg-opacity-5 transition-colors border"
                        style={{
                            backgroundColor: `${currentTheme.colors.muted}40`,
                            borderColor: currentTheme.colors.border,
                            color: focus ? currentTheme.colors.foreground : currentTheme.colors.mutedForeground,
                        }}
                    >
                        {focus || 'Click to set your monthly focus...'}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
