import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

interface NotificationsLayoutProps {
    children: ReactNode;
}

export default async function NotificationsLayout({ children }: NotificationsLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('theme_name')
                .eq('id', user.id)
                .single<{ theme_name: string | null }>();

            if (profile?.theme_name) {
                const theme = getThemeById(profile.theme_name);
                if (theme) {
                    initialThemeId = profile.theme_name;
                }
            }
        }
    } catch (error) {
        console.error('Error in NotificationsLayout:', error);
        // Use default theme if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar />
                {children}
            </div>
        </ThemeProvider>
    );
}
