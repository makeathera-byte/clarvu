import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
    // Onboarding is now handled by modal on dashboard
    redirect('/dashboard');
}
