'use client';

import { useState } from 'react';
import { SubGoal } from '@/app/goals/actions/goalsActions';
import { Check, Plus, X } from 'lucide-react';
import { useTheme } from '@/lib/theme/ThemeContext';

interface SubGoalsListProps {
    subGoals: SubGoal[];
    onToggle: (subGoalId: string) => void;
    onAdd: (text: string) => void;
    readonly?: boolean;
}

export function SubGoalsList({ subGoals, onToggle, onAdd, readonly = false }: SubGoalsListProps) {
    const { currentTheme } = useTheme();
    const [isAdding, setIsAdding] = useState(false);
    const [newText, setNewText] = useState('');

    const handleAdd = () => {
        if (newText.trim()) {
            onAdd(newText.trim());
            setNewText('');
            setIsAdding(false);
        }
    };

    const completedCount = subGoals.filter(sg => sg.completed).length;

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: currentTheme.colors.mutedForeground }}>
                    Sub-goals {subGoals.length > 0 && `(${completedCount}/${subGoals.length})`}
                </span>
                {!readonly && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-1 rounded hover:bg-black/5 transition-colors"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Sub-goals list */}
            <div className="space-y-1.5">
                {subGoals.map((subGoal) => (
                    <div
                        key={subGoal.id}
                        onClick={() => !readonly && onToggle(subGoal.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${readonly ? '' : 'cursor-pointer hover:bg-black/5'}`}
                        style={{
                            backgroundColor: `${currentTheme.colors.muted}40`,
                            opacity: subGoal.completed ? 0.6 : 1,
                        }}
                    >
                        <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0"
                            style={{
                                borderColor: subGoal.completed ? currentTheme.colors.primary : currentTheme.colors.border,
                                backgroundColor: subGoal.completed ? currentTheme.colors.primary : 'transparent',
                            }}
                        >
                            {subGoal.completed && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span
                            className={`text-sm flex-1 ${subGoal.completed ? 'line-through' : ''}`}
                            style={{ color: currentTheme.colors.foreground }}
                        >
                            {subGoal.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Add new sub-goal */}
            {isAdding && (
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                            if (e.key === 'Escape') setIsAdding(false);
                        }}
                        placeholder="Add sub-goal..."
                        className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{
                            backgroundColor: currentTheme.colors.muted,
                            color: currentTheme.colors.foreground,
                            border: `1px solid ${currentTheme.colors.border}`,
                        }}
                    />
                    <button
                        onClick={handleAdd}
                        className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: currentTheme.colors.primary, color: '#fff' }}
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: currentTheme.colors.mutedForeground }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
