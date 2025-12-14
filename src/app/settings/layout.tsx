'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsSidebar } from '@/components/settings';
import { supabaseClient } from '@/lib/supabase/client';

interface SettingsLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const [initialThemeId, setInitialThemeId] = useState(defaultTheme.id);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUserTheme() {
            try {
                // Get current user
                const { data: { user } } = await supabaseClient.auth.getUser();

                // Load theme from profile if user is authenticated
                if (user) {
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
                console.error('Error in SettingsLayout:', error);
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
                <SettingsSidebar />
                <div className="lg:pl-64">
                    {children}
                </div>
            </div>
        </ThemeProvider>
    );
}

