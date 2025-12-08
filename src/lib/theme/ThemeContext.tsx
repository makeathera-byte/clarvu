'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemePreset, themePresets, defaultTheme, getThemeById } from './presets';

interface CustomTheme {
    primary: string;
    accent: string;
    wallpaper: string | null;
}

interface ThemeContextType {
    currentTheme: ThemePreset;
    customTheme: CustomTheme | null;
    isCustomTheme: boolean;
    setTheme: (themeId: string) => void;
    setCustomTheme: (custom: CustomTheme) => void;
    clearCustomTheme: () => void;
    availableThemes: ThemePreset[];
    isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'clarvu-theme';
const CUSTOM_THEME_STORAGE_KEY = 'clarvu-custom-theme';

interface ThemeProviderProps {
    children: ReactNode;
    initialThemeId?: string;
}

export function ThemeProvider({ children, initialThemeId }: ThemeProviderProps) {
    // Initialize with the provided theme or default
    const getInitialTheme = () => {
        if (initialThemeId) {
            const theme = getThemeById(initialThemeId);
            if (theme) return theme;
        }
        return defaultTheme;
    };

    const [currentTheme, setCurrentTheme] = useState<ThemePreset>(getInitialTheme);
    const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);
    const [isCustomTheme, setIsCustomTheme] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load saved theme on mount (client-side only, respects initialThemeId from server)
    useEffect(() => {
        setMounted(true);

        // If we have an initial theme from server, use it and save to localStorage
        if (initialThemeId) {
            const theme = getThemeById(initialThemeId);
            if (theme) {
                setCurrentTheme(theme);
                localStorage.setItem(THEME_STORAGE_KEY, initialThemeId);
                return;
            }
        }

        // Otherwise, try to load from localStorage
        const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
        const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);

        if (savedCustomTheme) {
            try {
                const custom = JSON.parse(savedCustomTheme);
                setCustomThemeState(custom);
                setIsCustomTheme(true);
            } catch {
                // Invalid custom theme, fallback to preset
            }
        }

        if (savedThemeId && !savedCustomTheme) {
            const theme = getThemeById(savedThemeId);
            if (theme) {
                setCurrentTheme(theme);
            }
        }
    }, [initialThemeId]);

    // Apply theme CSS variables
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const colors = currentTheme.colors;

        // Set CSS variables
        root.style.setProperty('--theme-primary', colors.primary);
        root.style.setProperty('--theme-primary-foreground', colors.primaryForeground);
        root.style.setProperty('--theme-accent', colors.accent);
        root.style.setProperty('--theme-accent-foreground', colors.accentForeground);
        root.style.setProperty('--theme-background', colors.background);
        root.style.setProperty('--theme-foreground', colors.foreground);
        root.style.setProperty('--theme-card', colors.card);
        root.style.setProperty('--theme-card-foreground', colors.cardForeground);
        root.style.setProperty('--theme-muted', colors.muted);
        root.style.setProperty('--theme-muted-foreground', colors.mutedForeground);
        root.style.setProperty('--theme-border', colors.border);

        // Tile colors
        root.style.setProperty('--theme-tile-1', currentTheme.tiles.tile1);
        root.style.setProperty('--theme-tile-2', currentTheme.tiles.tile2);
        root.style.setProperty('--theme-tile-3', currentTheme.tiles.tile3);
        root.style.setProperty('--theme-tile-4', currentTheme.tiles.tile4);
        root.style.setProperty('--theme-tile-5', currentTheme.tiles.tile5);

        // Wallpaper
        root.style.setProperty('--theme-wallpaper', `url(${currentTheme.wallpaper})`);

        // Dark mode class
        if (currentTheme.isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        // Override with custom theme if active
        if (isCustomTheme && customTheme) {
            root.style.setProperty('--theme-primary', customTheme.primary);
            root.style.setProperty('--theme-accent', customTheme.accent);
            if (customTheme.wallpaper) {
                root.style.setProperty('--theme-wallpaper', `url(${customTheme.wallpaper})`);
            }
        }
    }, [currentTheme, customTheme, isCustomTheme, mounted]);

    const setTheme = (themeId: string) => {
        const theme = getThemeById(themeId);
        if (theme) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentTheme(theme);
                setIsCustomTheme(false);
                setCustomThemeState(null);
                localStorage.setItem(THEME_STORAGE_KEY, themeId);
                localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
                setTimeout(() => setIsTransitioning(false), 500);
            }, 200);
        }
    };

    const setCustomTheme = (custom: CustomTheme) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCustomThemeState(custom);
            setIsCustomTheme(true);
            localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(custom));
            setTimeout(() => setIsTransitioning(false), 500);
        }, 200);
    };

    const clearCustomTheme = () => {
        setIsCustomTheme(false);
        setCustomThemeState(null);
        localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <div className="opacity-0">{children}</div>;
    }

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                customTheme,
                isCustomTheme,
                setTheme,
                setCustomTheme,
                clearCustomTheme,
                availableThemes: themePresets,
                isTransitioning,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);

    // During SSR or when context is not available, return default values
    if (context === undefined) {
        return {
            currentTheme: defaultTheme,
            customTheme: null,
            isCustomTheme: false,
            setTheme: () => { },
            setCustomTheme: () => { },
            clearCustomTheme: () => { },
            availableThemes: themePresets,
            isTransitioning: false,
        };
    }

    return context;
}
