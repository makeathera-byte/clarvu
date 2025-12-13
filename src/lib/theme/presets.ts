// Theme presets for Clarvu
// Each theme includes primary/accent colors, background wallpaper, and tile palette

export interface ThemeColors {
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    destructive: string;
    destructiveForeground: string;
}

export interface TilePalette {
    tile1: string;
    tile2: string;
    tile3: string;
    tile4: string;
    tile5: string;
}

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    wallpaper: string;
    colors: ThemeColors;
    tiles: TilePalette;
    isDark: boolean;
}

export const themePresets: ThemePreset[] = [
    {
        id: 'forest',
        name: 'Forest',
        description: 'Calm greens inspired by nature',
        wallpaper: '/wallpapers/forest.jpg',
        isDark: true,
        colors: {
            primary: '#22c55e',
            primaryForeground: '#ffffff',
            accent: '#86efac',
            accentForeground: '#14532d',
            background: '#0a1f0a',
            foreground: '#e2e8d7',
            card: 'rgba(20, 40, 20, 0.8)',
            cardForeground: '#e2e8d7',
            muted: '#1a3a1a',
            mutedForeground: '#a3b89a',
            border: 'rgba(34, 197, 94, 0.2)',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        tiles: {
            tile1: 'rgba(34, 197, 94, 0.15)',
            tile2: 'rgba(74, 222, 128, 0.15)',
            tile3: 'rgba(134, 239, 172, 0.12)',
            tile4: 'rgba(22, 163, 74, 0.18)',
            tile5: 'rgba(21, 128, 61, 0.2)',
        },
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Deep blues of the sea',
        wallpaper: '/wallpapers/ocean.jpg',
        isDark: true,
        colors: {
            primary: '#0ea5e9',
            primaryForeground: '#ffffff',
            accent: '#7dd3fc',
            accentForeground: '#0c4a6e',
            background: '#0a1929',
            foreground: '#e0f2fe',
            card: 'rgba(12, 45, 72, 0.8)',
            cardForeground: '#e0f2fe',
            muted: '#164e63',
            mutedForeground: '#94a3b8',
            border: 'rgba(14, 165, 233, 0.2)',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        tiles: {
            tile1: 'rgba(14, 165, 233, 0.15)',
            tile2: 'rgba(56, 189, 248, 0.15)',
            tile3: 'rgba(125, 211, 252, 0.12)',
            tile4: 'rgba(2, 132, 199, 0.18)',
            tile5: 'rgba(3, 105, 161, 0.2)',
        },
    },
    {
        id: 'minimal',
        name: 'Minimal White',
        description: 'Clean and distraction-free',
        wallpaper: '/wallpapers/minimal.jpg',
        isDark: false,
        colors: {
            primary: '#18181b',
            primaryForeground: '#fafafa',
            accent: '#71717a',
            accentForeground: '#fafafa',
            background: '#ffffff',
            foreground: '#18181b',
            card: 'rgba(250, 250, 250, 0.9)',
            cardForeground: '#18181b',
            muted: '#f4f4f5',
            mutedForeground: '#71717a',
            border: 'rgba(0, 0, 0, 0.08)',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        tiles: {
            tile1: 'rgba(0, 0, 0, 0.03)',
            tile2: 'rgba(0, 0, 0, 0.05)',
            tile3: 'rgba(0, 0, 0, 0.04)',
            tile4: 'rgba(0, 0, 0, 0.06)',
            tile5: 'rgba(0, 0, 0, 0.02)',
        },
    },
    {
        id: 'space',
        name: 'Space',
        description: 'Cosmic purples and stars',
        wallpaper: '/wallpapers/space.jpg',
        isDark: true,
        colors: {
            primary: '#a855f7',
            primaryForeground: '#ffffff',
            accent: '#c084fc',
            accentForeground: '#3b0764',
            background: '#0f0a1a',
            foreground: '#f3e8ff',
            card: 'rgba(30, 20, 50, 0.8)',
            cardForeground: '#f3e8ff',
            muted: '#2e1a47',
            mutedForeground: '#a78bfa',
            border: 'rgba(168, 85, 247, 0.2)',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        tiles: {
            tile1: 'rgba(168, 85, 247, 0.15)',
            tile2: 'rgba(192, 132, 252, 0.15)',
            tile3: 'rgba(147, 51, 234, 0.12)',
            tile4: 'rgba(126, 34, 206, 0.18)',
            tile5: 'rgba(107, 33, 168, 0.2)',
        },
    },
    {
        id: 'neon',
        name: 'Dark Neon',
        description: 'Vibrant neon on dark',
        wallpaper: '/wallpapers/neon.jpg',
        isDark: true,
        colors: {
            primary: '#f43f5e',
            primaryForeground: '#ffffff',
            accent: '#fb7185',
            accentForeground: '#4c0519',
            background: '#0a0a0a',
            foreground: '#fafafa',
            card: 'rgba(20, 20, 20, 0.85)',
            cardForeground: '#fafafa',
            muted: '#262626',
            mutedForeground: '#a1a1aa',
            border: 'rgba(244, 63, 94, 0.25)',
            destructive: '#ef4444',
            destructiveForeground: '#ffffff',
        },
        tiles: {
            tile1: 'rgba(244, 63, 94, 0.12)',
            tile2: 'rgba(251, 113, 133, 0.12)',
            tile3: 'rgba(14, 165, 233, 0.12)',
            tile4: 'rgba(34, 197, 94, 0.12)',
            tile5: 'rgba(168, 85, 247, 0.12)',
        },
    },
];

export const getThemeById = (id: string): ThemePreset | undefined => {
    try {
        return themePresets.find((theme) => theme.id === id);
    } catch (error) {
        console.error('Error getting theme by ID:', error);
        return undefined;
    }
};

// Safely get default theme
function getDefaultThemeSafe(): ThemePreset {
    try {
        const minimal = themePresets.find(t => t.id === 'minimal');
        if (minimal) return minimal;
        if (themePresets.length > 0) return themePresets[0];
        // Fallback theme if all else fails
        return {
            id: 'minimal',
            name: 'Minimal',
            description: 'Default theme',
            wallpaper: '/wallpapers/minimal.jpg',
            isDark: false,
            colors: {
                primary: '#18181b',
                primaryForeground: '#fafafa',
                accent: '#71717a',
                accentForeground: '#fafafa',
                background: '#ffffff',
                foreground: '#18181b',
                card: 'rgba(250, 250, 250, 0.9)',
                cardForeground: '#18181b',
                muted: '#f4f4f5',
                mutedForeground: '#71717a',
                border: 'rgba(0, 0, 0, 0.08)',
                destructive: '#ef4444',
                destructiveForeground: '#ffffff',
            },
            tiles: {
                tile1: 'rgba(0, 0, 0, 0.03)',
                tile2: 'rgba(0, 0, 0, 0.05)',
                tile3: 'rgba(0, 0, 0, 0.04)',
                tile4: 'rgba(0, 0, 0, 0.06)',
                tile5: 'rgba(0, 0, 0, 0.02)',
            },
        };
    } catch (error) {
        console.error('Error getting default theme:', error);
        // Return a minimal fallback
        throw new Error('Failed to initialize default theme');
    }
}

export const defaultTheme = getDefaultThemeSafe();
