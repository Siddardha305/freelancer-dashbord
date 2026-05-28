'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Sparkles, HelpCircle, Cpu, Users, LayoutDashboard, CreditCard } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import TestimonialCard from '../shared/TestimonialCard';
import { InteractiveHoverButton, InteractiveHoverButtonOutline } from '../ui/InteractiveHoverButton';

const quickLinks = [
  {
    icon: Compass,
    title: 'Platform Tour',
    description: 'Explore every module — Client CRM, Kanban boards, Smart Ledgers, and PDF reports in one interactive walkthrough.',
    href: '/tour',
    glow: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    badge: '4 Modules'
  },
  {
    icon: Sparkles,
    title: 'SaaS Pricing',
    description: 'From a free Hobby workspace to our full Agency plan. Dynamic estimator shows your best ₹ tier instantly.',
    href: '/pricing',
    glow: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    badge: '3 Tiers'
  },
  {
    icon: HelpCircle,
    title: 'FAQs',
    description: 'Fast answers about privacy, data security, multi-currency billing, and custom rate configurations.',
    href: '/faqs',
    glow: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    badge: '4 Questions'
  },
  {
    icon: Cpu,
    title: 'Contact Us',
    description: "Dispatch a message through our secure terminal log. We'll connect you with the right setup team.",
    href: '/contact',
    glow: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    badge: 'Instant Log'
  }
];

const testimonials = [
  {
    text: 'FreelanceOS replaced Notion for me. The visual Kanban board is incredibly clear, helping me align deliverables with my clients seamlessly. Absolute game-changer.',
    author: 'Siddardha K.',
    role: 'High-Value Video Editor',
    tag: 'Video Production'
  },
  {
    text: 'The custom per-unit billing model is perfect. I bill per asset delivered, and marking a task approved updates my invoice ledger instantly.',
    author: 'Aryan Sharma',
    role: 'YouTube Thumbnail Designer',
    tag: 'Design & Graphics'
  },
  {
    text: 'Data privacy was critical. Having a secure private workspace gives me absolute confidence that my billing contracts are kept safe.',
    author: 'Neha Deshmukh',
    role: 'Brand Consultant & Designer',
    tag: 'Consulting'
  }
];

const stats = [
  { icon: Users, value: '2,400+', label: 'Active Freelancers' },
  { icon: LayoutDashboard, value: '18,000+', label: 'Tasks Delivered' },
  { icon: CreditCard, value: '₹4.2 Cr+', label: 'Revenue Tracked' },
  { icon: Sparkles, value: '99.9%', label: 'Uptime Reliability' },
];

export default function SocialProofSection() {
  return (
    <>
      {/* ── Navigate to Pages section ── */}
      <section className="py-28 border-t border-slate-900/60 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Explore FreelanceOS"
            badgeIcon={Compass}
            title="Everything you need in one place"
            description="Tap into every section of the platform. Each page is built to help you manage, track, and scale your freelance operation."
            centered={true}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, idx) => {
              const spanClass = 
                idx === 0 
                  ? 'lg:col-span-2 md:col-span-2' 
                  : idx === 1 
                  ? 'lg:col-span-1 md:col-span-1' 
                  : idx === 2 
                  ? 'lg:col-span-1 md:col-span-1' 
                  : 'lg:col-span-4 md:col-span-2 md:flex-row md:items-center md:gap-10';

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`group bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[2.2rem] p-8 flex flex-col justify-between hover:border-indigo-500/35 hover:bg-slate-905/70 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 relative overflow-hidden ${spanClass}`}
                >
                  {/* Glowing background accent on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className={idx === 3 ? 'flex-1 md:flex md:items-center md:justify-between w-full' : ''}>
                    <div className={idx === 3 ? 'md:flex md:items-center md:gap-6 md:max-w-2xl' : ''}>
                      <div className={`w-12 h-12 rounded-2xl ${item.glow} flex items-center justify-center mb-6 md:mb-0 shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div className={idx === 3 ? 'mt-4 md:mt-0' : ''}>
                        <h3 className="text-base font-black text-white tracking-tight mb-2 flex items-center gap-2">
                          {item.title}
                          {idx === 0 && <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase">Live Tour</span>}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    <div className={`mt-6 md:mt-0 flex items-center justify-between shrink-0 ${idx === 3 ? 'md:gap-6' : ''}`}>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${item.glow} ${item.iconColor} border-current/20`}>
                        {item.badge}
                      </span>
                      <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-950/20 transition-all">
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live platform stats ── */}
      <section className="py-16 border-t border-slate-900/60 bg-slate-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.02),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center group hover:-translate-y-0.5 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-900/60 border border-slate-805/80 mb-3.5 group-hover:border-indigo-500/30 group-hover:bg-indigo-950/25 transition-all shadow-sm">
                  <s.icon className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-450 transition-colors" />
                </div>
                <p className="text-3xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">{s.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 border-t border-slate-900/60 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Creator Endorsements"
            badgeIcon={Sparkles}
            title="What other freelancers say"
            description="Real feedback from verified independent creators running their businesses on FreelanceOS."
            centered={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((t, idx) => (
              <TestimonialCard
                key={idx}
                text={t.text}
                author={t.author}
                role={t.role}
                tag={t.tag}
              />
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-b from-slate-900/50 to-slate-950/70 backdrop-blur-md rounded-[2.5rem] border border-slate-800/60 p-12 sm:p-20 relative overflow-hidden shadow-2xl shadow-slate-950/60 group">
              {/* Double-layered glowing ambient lights */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none transition-transform group-hover:scale-110 duration-700" />
              <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
                  Ready to run your freelance business<br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">like a high-value SaaS company?</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                  Join thousands of independent editors, designers, and creators running their operations on FreelanceOS. Start free, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4.5 justify-center pt-2">
                  <InteractiveHoverButton href="/signup" className="w-full sm:w-auto py-4 px-8 shadow-lg shadow-indigo-600/15">
                    Start Free Workspace
                  </InteractiveHoverButton>
                  <InteractiveHoverButtonOutline href="/tour" className="w-full sm:w-auto py-4 px-8">
                    See the Platform
                  </InteractiveHoverButtonOutline>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
