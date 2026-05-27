'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import FaqSection from '@/website/components/faq/FaqSection';
import { HelpCircle } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function FaqsPage() {
  return (
    <WebsitePageLayout>
      {/* Premium Page Header Banner */}
      <div className="pt-36 pb-4 text-center max-w-4xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <TechBadge 
          label="Frequently Asked Questions" 
          icon={HelpCircle} 
          variant="slate" 
          className="mb-6"
        />

        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4 leading-tight">
          Find Fast Answers to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Your Questions</span>
        </h1>
        
        <p className="text-sm text-slate-400 font-semibold max-w-xl mx-auto leading-relaxed">
          Learn how FreelanceOS keeps your contracts secure, automates invoicing, and simplifies visual deadline tracking.
        </p>
      </div>

      {/* Main FAQ Section */}
      <div className="pb-24">
        <FaqSection />
      </div>
    </WebsitePageLayout>
  );
}
