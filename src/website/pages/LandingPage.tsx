'use client'

import React from 'react';
import Navbar from '../components/navbar/Navbar';
import HeroSection from '../components/hero/HeroSection';
import FeatureTour from '../components/features/FeatureTour';
import FaqSection from '../components/faq/FaqSection';
import ContactSection from '../components/contact/ContactSection';
import FooterSection from '../components/footer/FooterSection';
import ScrollReveal from '../components/scroll/ScrollReveal';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans relative">
      
      {/* Premium Dashboard Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_80%,transparent_100%)] opacity-80 pointer-events-none -z-10" />

      {/* Modular Floating Pill Console Navbar */}
      <Navbar />

      {/* Main Website Sections wrapped in premium viewport triggers */}
      <ScrollReveal duration={1200}>
        <HeroSection />
      </ScrollReveal>
      
      <ScrollReveal delay={150}>
        <FeatureTour />
      </ScrollReveal>
      
      <ScrollReveal delay={150}>
        <FaqSection />
      </ScrollReveal>
      
      <ScrollReveal delay={150}>
        <ContactSection />
      </ScrollReveal>
      
      <ScrollReveal delay={100}>
        <FooterSection />
      </ScrollReveal>
      
    </div>
  );
}
