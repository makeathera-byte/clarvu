import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
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
    let user = null;
    let userName = 'User';
    let needsOnboarding = false;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;

        // Load theme, user name, and check for onboarding from profile if user is authenticated
        if (user) {
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

            // Check if OAuth user needs onboarding (no country set)
            if (!profile?.country) {
                needsOnboarding = true;
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
                <Navbar userName={userName} />
                <FocusSoundPanel />
                {user ? (
                    <RealtimeProvider userId={user.id} needsOnboarding={needsOnboarding}>
                        {children}
                    </RealtimeProvider>
                ) : (
                    children
                )}
            </div>
        </ThemeProvider>
    );
}

