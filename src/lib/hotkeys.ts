'use client';

import { useEffect, useCallback } from 'react';

interface HotkeyConfig {
    key: string;
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    handler: () => void;
}

/**
 * Hook for registering global keyboard shortcuts
 */
export function useHotkeys(hotkeys: HotkeyConfig[], enabled: boolean = true) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger hotkeys when typing in input fields (except for Escape)
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);

        for (const hotkey of hotkeys) {
            const keyMatch = e.key.toLowerCase() === hotkey.key.toLowerCase();
            const altMatch = hotkey.alt ? e.altKey : !e.altKey;
            const ctrlMatch = hotkey.ctrl ? e.ctrlKey : !e.ctrlKey;
            const shiftMatch = hotkey.shift ? e.shiftKey : !e.shiftKey;

            if (keyMatch && altMatch && ctrlMatch && shiftMatch) {
                // Allow Escape key even when typing
                if (hotkey.key === 'Escape' || !isTyping) {
                    e.preventDefault();
                    hotkey.handler();
                    return;
                }
            }
        }
    }, [enabled, hotkeys]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Global hotkeys for the dashboard
 * - Alt+N: Open new task modal
 * - Alt+1-6: Select category by index
 * - Escape: Close any open modal
 * - Enter: Submit focused form
 */
export const HOTKEY_DESCRIPTIONS = {
    'Alt+N': 'Open new task popup',
    'Alt+1': 'Select category 1',
    'Alt+2': 'Select category 2',
    'Alt+3': 'Select category 3',
    'Alt+4': 'Select category 4',
    'Alt+5': 'Select category 5',
    'Alt+6': 'Select category 6',
    'Escape': 'Close popup',
    'Enter': 'Submit task (when focused)',
};
