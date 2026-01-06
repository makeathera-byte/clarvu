import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';
import { CalendarViewToggleNavbar } from '@/components/calendar/CalendarViewToggleNavbar';

interface CalendarLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function CalendarLayout({ children }: CalendarLayoutProps) {
    let initialThemeId = defaultTheme.id;
    let userName = 'User';
    let isAdmin = false;

    try {
        const supabase = await createClient();

        // Get user for authentication
        const { data: { user } } = await supabase.auth.getUser();

        // Load theme and user name from profile if user is authenticated
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('theme_name, full_name, country, is_admin')
                .eq('id', user.id)
                .single<ProfileTheme & { full_name: string | null; country: string | null; is_admin: boolean | null }>();

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

            // Set admin status
            if (profile?.is_admin) {
                isAdmin = true;
            }
        }
    } catch (error) {
        console.error('Error in CalendarLayout:', error);
        // Use defaults if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar userName={userName} isAdmin={isAdmin} />
                <CalendarViewToggleNavbar />
                <FocusSoundPanel />
                <RealtimeProvider userId={null}>
                    <div className="pt-20">
                        {children}
                    </div>
                </RealtimeProvider>
            </div>
        </ThemeProvider>
    );
}
