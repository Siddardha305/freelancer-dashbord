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
        <div id="features-tabs" className="w-full z-10 relative mt-6">
          <style>{`
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
              50% { transform: translateY(-15px) rotate(0.5deg); }
            }
            @keyframes float-reverse {
              0%, 100% { transform: translateY(0px) rotate(1.5deg); }
              50% { transform: translateY(15px) rotate(-0.5deg); }
            }
            .animate-float-1 {
              animation: float-slow 6s ease-in-out infinite;
            }
            .animate-float-2 {
              animation: float-reverse 7s ease-in-out infinite;
            }
          `}</style>

          {/* Left Floating Card: Revision task */}
          <div 
            className="hidden lg:block absolute -left-12 top-1/4 z-20 bg-slate-950/75 backdrop-blur-xl border border-slate-800/80 p-4.5 rounded-2xl shadow-2xl w-56 text-left animate-float-1"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-black uppercase tracking-wider">
                Revision Requested
              </span>
              <span className="text-[9px] font-bold text-slate-500">v3</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Video Thumbnail Asset</h4>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-900/60">
              <div className="h-6 w-6 rounded-full bg-slate-850 flex items-center justify-center text-[9px] font-extrabold text-slate-400 border border-slate-800">
                SK
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-200">Siddardha K.</p>
                <p className="text-[8px] font-semibold text-slate-505">Video Producer</p>
              </div>
            </div>
          </div>

          {/* Right Floating Card: Payout Summary */}
          <div 
            className="hidden lg:block absolute -right-12 top-1/3 z-20 bg-slate-950/75 backdrop-blur-xl border border-slate-800/80 p-4.5 rounded-2xl shadow-2xl w-56 text-left animate-float-2"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-405 text-[8px] font-black uppercase tracking-wider">
                Payout Settled
              </span>
              <span className="text-[9px] font-bold text-slate-500">Ledger</span>
            </div>
            <p className="text-lg font-black text-emerald-400 tracking-tight">₹45,000</p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Approved Milestone payment</p>
            <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-900/60">
              <div className="h-6 w-6 rounded-full bg-slate-850 flex items-center justify-center text-[9px] font-extrabold text-slate-450 border border-slate-800">
                AS
              </div>
              <p className="text-[10px] font-bold text-slate-200">Aryan Sharma</p>
            </div>
          </div>

          <ConsoleWindow 
            title="freelanceos_workspace_v1.1" 
            imageSrc="/dashbord pics/maindashbord.png" 
            imageAlt="FreelanceOS Unified Workspace"
          />
        </div>
      </section>

      {/* Premium Segmented Dashboard Metrics Row */}
      <section className="bg-slate-950/20 border-y border-slate-900/60 py-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.03),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
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
