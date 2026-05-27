'use client'

import React from 'react';
import { Sparkles, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import TechBadge from '../shared/TechBadge';
import ConsoleWindow from '../shared/ConsoleWindow';
import MetricsCard from '../shared/MetricsCard';
import { InteractiveHoverButton, InteractiveHoverButtonOutline } from '../ui/InteractiveHoverButton';

export default function HeroSection() {
  return (
    <>
      {/* Subtle flares for premium background depth */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        
        {/* Sleek dashboard-matched tag badge */}
        <TechBadge 
          label="The Smart Platform for Modern Independent Creators"
          icon={Sparkles}
          variant="slate"
          className="mb-8"
        />

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white max-w-5xl leading-[1.05] mb-8">
          The Clean, Elegant Workspace to Run Your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Entire Freelance Business</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 font-bold uppercase tracking-widest max-w-2xl leading-relaxed mb-12">
          Organize clients, manage visual project boards, log multi-currency payments, and generate professional PDF reports in one gorgeous, secure workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 z-10 w-full sm:w-auto">
          <InteractiveHoverButton href="/signup" className="w-full sm:w-auto py-4 px-8">
            Get Started
          </InteractiveHoverButton>
          
          <InteractiveHoverButtonOutline href="#pricing" className="w-full sm:w-auto py-4 px-8">
            Explore Plans
          </InteractiveHoverButtonOutline>
        </div>

        {/* Premium Dashboard Application Frame Window */}
        <div id="features-tabs" className="w-full z-10">
          <ConsoleWindow 
            title="freelanceos_workspace_v1.1" 
            imageSrc="/dashbord pics/maindashbord.png" 
            imageAlt="FreelanceOS Unified Workspace"
          />
        </div>
      </section>

      {/* Premium Segmented Dashboard Metrics Row */}
      <section className="bg-slate-950/20 border-y border-slate-800/60 py-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Client CRM', value: 'Smart Hub', desc: 'Manage unlimited clients & rates', icon: Shield },
            { label: 'Visual Kanban', value: 'Intuitive Boards', desc: 'Track task stages and timelines', icon: Layers },
            { label: 'Smart Ledgers', value: 'Multi-Currency', desc: 'Log payments & track invoices', icon: RefreshCw },
            { label: 'Reports Export', value: 'One-Click PDF', desc: 'Generate professional reports', icon: Cpu },
          ].map((item, idx) => (
            <MetricsCard 
              key={idx}
              label={item.label}
              value={item.value}
              description={item.desc}
              icon={item.icon}
            />
          ))}
        </div>
      </section>
    </>
  );
}
