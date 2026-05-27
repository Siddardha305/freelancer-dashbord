'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import ContactSection from '@/website/components/contact/ContactSection';
import { Cpu } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function ContactPage() {
  return (
    <WebsitePageLayout>
      {/* Premium Page Header Banner */}
      <div className="pt-36 pb-4 text-center max-w-4xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <TechBadge 
          label="Secure Connection Pipeline" 
          icon={Cpu} 
          variant="indigo" 
          className="mb-6"
        />

        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4 leading-tight">
          Let’s Scale Your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Freelance Operation</span>
        </h1>
        
        <p className="text-sm text-slate-400 font-semibold max-w-xl mx-auto leading-relaxed">
          Need custom enterprise setup, billing assistance, or simply have ideas? Dispatch a message down our secure log terminal.
        </p>
      </div>

      {/* Main Contact Section */}
      <div className="pb-24">
        <ContactSection />
      </div>
    </WebsitePageLayout>
  );
}
