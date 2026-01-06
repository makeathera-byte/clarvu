'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
    onNewTask?: () => void;
    onEditTask: () => void;
    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;
}

export function useKeyboardShortcuts({
    onNewTask,
    onEditTask,
    selectedTaskId,
    setSelectedTaskId,
}: KeyboardShortcutsOptions) {
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'n':
                if (onNewTask) {
                    event.preventDefault();
                    onNewTask();
                }
                break;
            case 'enter':
                if (selectedTaskId) {
                    event.preventDefault();
                    onEditTask();
                }
                break;
            case 'escape':
                event.preventDefault();
                setSelectedTaskId(null);
                break;
            default:
                break;
        }
    }, [onNewTask, onEditTask, selectedTaskId, setSelectedTaskId]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);
}
