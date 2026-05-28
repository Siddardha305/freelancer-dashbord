'use client'

import React from 'react';
import WebsitePageLayout from '../components/shared/WebsitePageLayout';
import HeroSection from '../components/hero/HeroSection';
import FeatureTour from '../components/features/FeatureTour';
import NewFeaturesShowcase from '../components/features/NewFeaturesShowcase';
import SocialProofSection from '../components/home/SocialProofSection';
import ScrollReveal from '../components/scroll/ScrollReveal';

export default function LandingPage() {
  return (
    <WebsitePageLayout>
      {/* Hero — value proposition + console frame */}
      <ScrollReveal duration={1200}>
        <HeroSection />
      </ScrollReveal>
      
      {/* Feature Tour preview strip */}
      <ScrollReveal delay={100}>
        <FeatureTour />
      </ScrollReveal>

      {/* Advanced capabilities spotlight */}
      <ScrollReveal delay={100}>
        <NewFeaturesShowcase />
      </ScrollReveal>
      
      {/* Page nav cards, platform stats, testimonials, final CTA */}
      <ScrollReveal delay={100}>
        <SocialProofSection />
      </ScrollReveal>
    </WebsitePageLayout>
  );
}

