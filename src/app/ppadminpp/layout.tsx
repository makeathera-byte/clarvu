import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { redirect } from 'next/navigation';


interface AdminLayoutProps {
    children: ReactNode;
}

interface ProfileData {
    theme_name: string | null;
    is_admin: boolean;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    let initialThemeId = defaultTheme.id;

    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/auth/login');
        }

        // Load profile including admin check
        const { data: profile } = await supabase
            .from('profiles')
            .select('theme_name, is_admin')
            .eq('id', user.id)
            .single() as { data: ProfileData | null };

        // Check if user is admin
        if (!profile?.is_admin) {
            redirect('/dashboard');
        }

        if (profile?.theme_name) {
            const theme = getThemeById(profile.theme_name);
            if (theme) {
                initialThemeId = profile.theme_name;
            }
        }
    } catch (error) {
        console.error('Error in AdminLayout:', error);
        // Use default theme if there's an error, but still redirect if needed
        redirect('/auth/login');
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            {children}
        </ThemeProvider>
    );
}
