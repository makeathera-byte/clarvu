import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';


interface GoalsLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function GoalsLayout({ children }: GoalsLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

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
        console.error('Error in GoalsLayout:', error);
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar />
                <FocusSoundPanel />
                <div className="pt-20"> {/* Add padding for fixed navbar */}
                    <RealtimeProvider userId={null}>
                        {children}
                    </RealtimeProvider>
                </div>
            </div>
        </ThemeProvider>
    );
}
