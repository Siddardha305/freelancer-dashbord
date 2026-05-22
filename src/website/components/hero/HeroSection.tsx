'use client'

import React from 'react';
import { ArrowRight, Sparkles, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import TechBadge from '../shared/TechBadge';
import ActionButton from '../shared/ActionButton';
import ConsoleWindow from '../shared/ConsoleWindow';
import MetricsCard from '../shared/MetricsCard';

export default function HeroSection() {
  return (
    <>
      {/* Subtle flares for premium background depth */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-505/5 bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        
        {/* Sleek dashboard-matched tag badge */}
        <TechBadge 
          label="The Smart Platform for Modern Independent Creators"
          icon={Sparkles}
          variant="slate"
          className="mb-8"
        />

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 max-w-5xl leading-[1.05] mb-8">
          The Clean, Elegant Workspace to Run Your <span className="text-indigo-650">Entire Freelance Business</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 font-bold uppercase tracking-widest max-w-2xl leading-relaxed mb-12">
          Organize clients, manage visual project boards, log multi-currency payments, and generate professional PDF reports in one gorgeous, secure workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 z-10">
          <ActionButton 
            href="/signup" 
            variant="primary" 
            icon={ArrowRight} 
            iconPosition="right"
          >
            Get Started
          </ActionButton>
          
          <ActionButton 
            href="#contact" 
            variant="secondary"
          >
            Explore Features
          </ActionButton>
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
      <section className="bg-white border-y border-slate-200/80 py-12 px-6 sm:px-12">
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
