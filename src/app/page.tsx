import { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { PositioningSection } from '@/components/landing/PositioningSection';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { Features } from '@/components/landing/Features';
import { WhoItsFor } from '@/components/landing/WhoItsFor';
import { PricingTeaser } from '@/components/landing/PricingTeaser';
import { CTA } from '@/components/landing/CTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { SoftwareApplicationSchema } from '@/components/seo/SoftwareApplicationSchema';
import { WebApplicationSchema } from '@/components/seo/WebApplicationSchema';

export const metadata: Metadata = {
  title: 'Clarvu — Productivity Tracker for Business Owners',
  description: 'Track focus, eliminate wasted time, and build real productivity. Deep work analytics, AI-powered insights, and time tracking designed for business owners who actually run things.',
  keywords: [
    'productivity tracker',
    'time tracking app',
    'focus tracking software',
    'deep work analytics',
    'productivity app for business owners',
    'eliminate wasted time',
    'focus session timer',
    'AI productivity coach',
    'business productivity tool',
    'time management dashboard',
  ],
  openGraph: {
    title: 'Clarvu — Productivity Tracker for Business Owners',
    description: 'Track focus, eliminate wasted time, and build real productivity. Deep work analytics and AI insights for business owners.',
    url: 'https://clarvu.com',
    type: 'website',
    images: [
      {
        url: '/dashboard_preview_hero_1765838464750.png',
        width: 1200,
        height: 630,
        alt: 'Clarvu Dashboard - Productivity Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clarvu — Productivity Tracker for Business Owners',
    description: 'Track focus, eliminate wasted time, and build real productivity with clarity.',
    images: ['/dashboard_preview_hero_1765838464750.png'],
  },
  alternates: {
    canonical: 'https://clarvu.com',
  },
};

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebApplicationSchema />

      <main className="min-h-screen">
        <LandingNavbar />
        <Hero />
        <ProblemSection />
        <PositioningSection />
        <ProductShowcase />
        <Features />
        <WhoItsFor />
        <PricingTeaser />
        <CTA />
        <LandingFooter />
      </main>
    </>
  );
}
