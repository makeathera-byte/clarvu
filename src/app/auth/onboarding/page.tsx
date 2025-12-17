import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
    const user = await getCurrentUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect('/auth/login');
    }

    return <OnboardingModal />;
}
