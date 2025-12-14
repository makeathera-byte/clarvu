import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { redirect } from 'next/navigation';


interface RoutineLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function RoutineLayout({ children }: RoutineLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/auth/login');
        }

        // Load theme from profile
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
    } catch (error) {
        console.error('Error in SummariesLayout:', error);
        // Use default theme if there's an error, but still redirect if needed
        redirect('/auth/login');
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
