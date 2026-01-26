import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsSidebar } from '@/components/settings';

interface SettingsLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
    let initialThemeId = defaultTheme.id;
    let userName = 'User';
    let userEmail: string | null = null;
    let userAvatar: string | null = null;
    let isAdmin = false;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Load theme from profile if user is authenticated
        if (user) {
            userEmail = user.email || null;
            userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('theme_name, full_name, is_admin')
                .eq('id', user.id)
                .single<ProfileTheme & { full_name: string | null; is_admin: boolean | null }>();

            if (profile?.theme_name) {
                const theme = getThemeById(profile.theme_name);
                if (theme) {
                    initialThemeId = profile.theme_name;
                }
            }

            if (profile?.full_name) {
                userName = profile.full_name;
            }

            if (profile?.is_admin) {
                isAdmin = true;
            }
        }
    } catch (error) {
        console.error('Error in SettingsLayout:', error);
        // Use default theme if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar userName={userName} userEmail={userEmail} userAvatar={userAvatar} isAdmin={isAdmin} />
                <SettingsSidebar />
                <div className="lg:pl-64">
                    {children}
                </div>
            </div>
        </ThemeProvider>
    );
}

