import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    let initialThemeId = defaultTheme.id;
    let userName = 'User';
    let userEmail: string | null = null;
    let userAvatar: string | null = null;

    try {
        const supabase = await createClient();

        // Try to get user for theme preferences (optional - won't block if user not found)
        const { data: { user } } = await supabase.auth.getUser();

        // Load theme and user name from profile if user is authenticated
        if (user) {
            // Get user email and avatar from auth user metadata
            userEmail = user.email || null;
            userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('theme_name, full_name, country')
                .eq('id', user.id)
                .single<ProfileTheme & { full_name: string | null; country: string | null }>();

            if (profile?.theme_name) {
                const theme = getThemeById(profile.theme_name);
                if (theme) {
                    initialThemeId = profile.theme_name;
                }
            }

            // Set user name if available
            if (profile?.full_name) {
                userName = profile.full_name;
            }
        }
    } catch (error) {
        console.error('Error in DashboardLayout:', error);
        // Use defaults if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar userName={userName} userEmail={userEmail} userAvatar={userAvatar} />
                <FocusSoundPanel />
                <RealtimeProvider userId={null}>
                    {children}
                </RealtimeProvider>
            </div>
        </ThemeProvider>
    );
}

