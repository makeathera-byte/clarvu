import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getThemeById, defaultTheme } from '@/lib/theme/presets';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { BackgroundRenderer } from '@/components/theme/BackgroundRenderer';
import { Navbar } from '@/components/layout/Navbar';
import { FocusSoundPanel } from '@/components/focus/FocusSoundPanel';
import { RealtimeProvider } from '@/components/realtime';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface ProfileTheme {
    theme_name: string | null;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    let initialThemeId = defaultTheme.id;
    let user = null;
    let userName = 'User';
    let needsOnboarding = false;

    try {
        const supabase = await createClient();

        // Get current user - retry if not found (might be timing issue after OAuth)
        let { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        user = authUser;
        
        // If no user found, wait and retry once (OAuth callback timing issue)
        if (!user && !authError) {
            console.log('[DashboardLayout] No user found initially, waiting and retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retryResult = await supabase.auth.getUser();
            user = retryResult.data?.user || null;
            if (user) {
                console.log('[DashboardLayout] ✅ User found on retry');
            } else {
                console.log('[DashboardLayout] ❌ No user found after retry');
            }
        }
        
        // If still no user, redirect to login
        if (!user) {
            console.log('[DashboardLayout] Redirecting to login - no user found');
            redirect('/auth/login');
        }

        // Load theme, user name, and check for onboarding from profile if user is authenticated
        // Profile should exist (created by database trigger), but we handle gracefully if not
        if (user) {
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('theme_name, full_name, country')
                .eq('id', user.id)
                .single<ProfileTheme & { full_name: string | null; country: string | null }>();

            // If profile not found, wait and retry multiple times
            // This handles RLS timing issues where profile exists but isn't visible yet
            if (!profile && error?.code === 'PGRST116') {
                // Retry up to 3 times with increasing delays
                for (let attempt = 0; attempt < 3; attempt++) {
                    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                    const retryResult = await supabase
                        .from('profiles')
                        .select('theme_name, full_name, country')
                        .eq('id', user.id)
                        .single<ProfileTheme & { full_name: string | null; country: string | null }>();
                    
                    if (retryResult.data) {
                        profile = retryResult.data;
                        console.log(`✅ Profile found in dashboard layout after ${attempt + 1} retry attempt(s)`);
                        break;
                    }
                }
            }

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

            // Check if OAuth user needs onboarding (no country set)
            if (!profile?.country) {
                needsOnboarding = true;
            }
        }
    } catch (error) {
        console.error('Error in DashboardLayout:', error);
        // Use defaults if there's an error
    }

    return (
        <ThemeProvider initialThemeId={initialThemeId}>
            <div className="min-h-screen">
                <BackgroundRenderer />
                <Navbar userName={userName} />
                <FocusSoundPanel />
                {user ? (
                    <RealtimeProvider userId={user.id} needsOnboarding={needsOnboarding}>
                        {children}
                    </RealtimeProvider>
                ) : (
                    children
                )}
            </div>
        </ThemeProvider>
    );
}

