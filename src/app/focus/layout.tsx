import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';


interface FocusLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function FocusLayout({ children }: FocusLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();

        // Get current user (optional - for theme loading)
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
        console.error('Error in FocusLayout:', error);
        // Use default theme if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            {children}
        </ThemeProvider>
    );
}
