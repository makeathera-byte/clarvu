import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsSidebar } from '@/components/settings';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

interface SettingsLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

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
        console.error('Error in SettingsLayout:', error);
        // Use default theme if there's an error
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

