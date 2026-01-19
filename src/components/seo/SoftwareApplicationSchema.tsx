import { SoftwareApplication, WithContext } from 'schema-dts';

export function SoftwareApplicationSchema() {
    const schema: WithContext<SoftwareApplication> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Clarvu',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Productivity',
        operatingSystem: 'Web, iOS, Android (PWA)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier available with premium plans',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100',
            bestRating: '5',
            worstRating: '1',
        },
        description: 'Track focus, eliminate wasted time, and build real productivity. Clarvu helps business owners with deep work analytics, AI insights, and time tracking that actually works.',
        url: 'https://clarvu.com',
        screenshot: 'https://clarvu.com/dashboard_preview_hero_1765838464750.png',
        featureList: [
            'Deep Work Analytics',
            'AI-Powered Productivity Insights',
            'Focus Session Tracking',
            'Time Management Dashboard',
            'Business-Focused Categories',
            'Adaptive Focus Sounds',
            'Goals & Weekly Reviews',
            'Productivity Score Tracking',
            'Task Completion Analytics',
            'Distraction Detection',
        ],
        author: {
            '@type': 'Organization',
            name: 'Clarvu Team',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
