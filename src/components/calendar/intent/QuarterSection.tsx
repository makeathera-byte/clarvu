'use client';

import { useState, useEffect, memo } from 'react';
import { useTheme } from '@/lib/theme/ThemeContext';
import { Goal } from '@/lib/store/useGoalsStore';
import { CompactMonthGrid } from './CompactMonthGrid';
import { Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuarterFocus, updateQuarterFocus } from '@/app/calendar/actions/quarterFocusActions';

interface QuarterSectionProps {
    quarter: 1 | 2 | 3 | 4;
    year: number;
    goals: Goal[];
    hoveredGoalId: string | null;
    onDayClick?: (date: Date) => void;
    onMonthClick?: (month: number) => void;
}

/**
 * QuarterSection - Single quarter with 3 months and editable focus
 * Memoized for performance
 */
export const QuarterSection = memo(function QuarterSection({
    quarter,
    year,
    goals,
    hoveredGoalId,
    onDayClick,
    onMonthClick
}: QuarterSectionProps) {
    const { currentTheme } = useTheme();
    const [isEditingFocus, setIsEditingFocus] = useState(false);
    const [focus, setFocus] = useState('');
    const [tempFocus, setTempFocus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingFocus, setIsLoadingFocus] = useState(true);

    // Calculate months for this quarter (0-indexed)
    const startMonth = (quarter - 1) * 3;
    const months = [startMonth, startMonth + 1, startMonth + 2];

    // Load quarter focus
    useEffect(() => {
        const loadFocus = async () => {
            setIsLoadingFocus(true);
            const { focus: loadedFocus } = await getQuarterFocus(year, quarter);
            setFocus(loadedFocus || '');
            setTempFocus(loadedFocus || '');
            setIsLoadingFocus(false);
        };
        loadFocus();
    }, [year, quarter]);

    const handleSave = async () => {
        if (tempFocus.trim() === focus.trim()) {
            setIsEditingFocus(false);
            return;
        }

        setIsSaving(true);
        try {
            await updateQuarterFocus(year, quarter, tempFocus.trim());
            setFocus(tempFocus.trim());
            setIsEditingFocus(false);
        } catch (error) {
            console.error('Failed to save quarter focus:', error);
            setTempFocus(focus);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempFocus(focus);
        setIsEditingFocus(false);
    };

    return (
        <div
            className="p-4 rounded-xl border"
            style={{
                backgroundColor: currentTheme.colors.card,
                borderColor: currentTheme.colors.border,
            }}
        >
            {/* Quarter header with focus */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h2
                        className="text-lg font-bold"
                        style={{ color: currentTheme.colors.foreground }}
                    >
                        Q{quarter}
                    </h2>
                    {!isEditingFocus && !isLoadingFocus && (
                        <button
                            onClick={() => setIsEditingFocus(true)}
                            className="p-1 rounded hover:bg-opacity-10 transition-colors"
                            style={{ color: currentTheme.colors.mutedForeground }}
                        >
                            <Edit3 className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Quarter Focus Editor */}
                {!isLoadingFocus && (
                    <AnimatePresence mode="wait">
                        {isEditingFocus ? (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                <input
                                    type="text"
                                    value={tempFocus}
                                    onChange={(e) => setTempFocus(e.target.value)}
                                    placeholder={`Q${quarter} focus...`}
                                    className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
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
                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors disabled:opacity-50"
                                        style={{
                                            backgroundColor: currentTheme.colors.primary,
                                            color: currentTheme.colors.primaryForeground,
                                        }}
                                    >
                                        <Check className="w-3 h-3" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="p-1 text-xs rounded transition-colors disabled:opacity-50"
                                        style={{
                                            backgroundColor: currentTheme.colors.muted,
                                            color: currentTheme.colors.foreground,
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onClick={() => setIsEditingFocus(true)}
                                className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                    color: focus ? currentTheme.colors.foreground : currentTheme.colors.mutedForeground,
                                    fontStyle: focus ? 'normal' : 'italic',
                                }}
                            >
                                {focus || 'Click to set quarter focus...'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* 3 months in a row */}
            <div className="grid grid-cols-3 gap-3">
                {months.map((monthIndex) => (
                    <CompactMonthGrid
                        key={monthIndex}
                        year={year}
                        month={monthIndex}
                        goals={goals}
                        hoveredGoalId={hoveredGoalId}
                        onDayClick={onDayClick}
                        onMonthClick={() => onMonthClick?.(monthIndex)}
                    />
                ))}
            </div>
        </div>
    );
});
