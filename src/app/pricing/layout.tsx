import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Simple, transparent pricing for Clarvu productivity tracker. Start free, upgrade anytime. Track focus, eliminate wasted time, and build real productivity with deep work analytics and AI insights.',
    keywords: [
        'productivity tracker pricing',
        'time tracking app cost',
        'focus tracking pricing',
        'productivity software pricing',
        'business productivity app pricing',
    ],
    openGraph: {
        title: 'Pricing - Clarvu Productivity Tracker',
        description: 'Simple, transparent pricing. Start free and upgrade when you\'re ready. No credit card required.',
        url: 'https://clarvu.com/pricing',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pricing - Clarvu Productivity Tracker',
        description: 'Simple, transparent pricing. Start free and upgrade when you\'re ready.',
    },
    alternates: {
        canonical: 'https://clarvu.com/pricing',
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
