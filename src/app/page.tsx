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

export default function HomePage() {
  return (
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
  );
}
