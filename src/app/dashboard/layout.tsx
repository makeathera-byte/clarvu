'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';
import { supabaseClient } from '@/lib/supabase/client';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [initialThemeId, setInitialThemeId] = useState(defaultTheme.id);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUserTheme() {
            try {
                // Get current user
                const { data: { user } } = await supabaseClient.auth.getUser();

                if (user) {
                    setUserId(user.id);

                    // Load theme from profile
                    const { data: profile } = await supabaseClient
                        .from('profiles')
                        .select('theme_name')
                        .eq('id', user.id)
                        .single<ProfileTheme>();

                    if (profile?.theme_name) {
                        const theme = getThemeById(profile.theme_name);
                        if (theme) {
                            setInitialThemeId(profile.theme_name);
                        }
                    }
                }
            } catch (error) {
                console.error('Error in DashboardLayout:', error);
                // Use default theme if there's an error
            } finally {
                setIsLoading(false);
            }
        }

        loadUserTheme();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar />
                <FocusSoundPanel />
                {userId ? (
                    <RealtimeProvider userId={userId}>
                        {children}
                    </RealtimeProvider>
                ) : (
                    children
                )}
            </div>
        </ThemeProvider>
    );
}

