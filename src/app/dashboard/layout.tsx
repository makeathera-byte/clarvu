import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    let initialThemeId = defaultTheme.id;
    let user = null;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;

        // Load theme from profile if user is authenticated
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('theme_name')
                .eq('id', user.id)
                .single<ProfileTheme>();

            if (profile?.theme_name) {
                const theme = getThemeById(profile.theme_name);
                if (theme) {
                    initialThemeId = profile.theme_name;
                }
            }
        }
    } catch (error) {
        console.error('Error in DashboardLayout:', error);
        // Use default theme if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar />
                <FocusSoundPanel />
                {user ? (
                    <RealtimeProvider userId={user.id}>
                        {children}
                    </RealtimeProvider>
                ) : (
                    children
                )}
            </div>
        </ThemeProvider>
    );
}

