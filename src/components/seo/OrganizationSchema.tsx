import { Organization, WithContext } from 'schema-dts';

export function OrganizationSchema() {
    const schema: WithContext<Organization> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Clarvu',
        url: 'https://clarvu.com',
        logo: 'https://clarvu.com/clarvu-logo.png',
        description: 'Productivity tracking app for business owners to track focus, eliminate wasted time, and build real productivity.',
        sameAs: [
            // Add social media profiles when available
            // 'https://twitter.com/clarvu',
            // 'https://linkedin.com/company/clarvu',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            availableLanguage: ['English'],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
