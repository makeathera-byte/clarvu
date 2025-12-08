import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

interface TimerLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function TimerLayout({ children }: TimerLayoutProps) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Default theme values
    let initialThemeId = defaultTheme.id;

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

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            {children}
        </ThemeProvider>
    );
}
