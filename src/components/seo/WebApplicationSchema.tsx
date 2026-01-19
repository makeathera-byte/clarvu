import { WebApplication, WithContext } from 'schema-dts';

export function WebApplicationSchema() {
    const schema: WithContext<WebApplication> = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Clarvu',
        url: 'https://clarvu.com',
        description: 'Productivity tracking web app for business owners to track focus, eliminate wasted time, and build real productivity with clarity.',
        applicationCategory: 'Productivity',
        operatingSystem: 'Any (Web-based)',
        browserRequirements: 'Requires JavaScript. Modern browser recommended.',
        permissions: 'notifications, microphone (optional for focus sounds)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        author: {
            '@type': 'Organization',
            name: 'Clarvu',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
