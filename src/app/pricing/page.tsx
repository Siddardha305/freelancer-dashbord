'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import PricingSection from '@/website/components/pricing/PricingSection';
import { Sparkles } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function PricingPage() {
  return (
    <WebsitePageLayout>
      {/* Premium Page Header Banner */}
      <div className="pt-36 pb-4 text-center max-w-4xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <TechBadge 
          label="Flexible SaaS Tiers" 
          icon={Sparkles} 
          variant="emerald" 
          className="mb-6"
        />

        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4 leading-tight">
          Value-Driven Plans for <span className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Every Growth Stage</span>
        </h1>
        
        <p className="text-sm text-slate-400 font-semibold max-w-xl mx-auto leading-relaxed">
          From independent creators to growing production agencies, choose the plan that aligns with your active client load and billing scale.
        </p>
      </div>

      {/* Main Pricing Section */}
      <div className="pb-24">
        <PricingSection />
      </div>
    </WebsitePageLayout>
  );
}
