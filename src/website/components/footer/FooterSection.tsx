'use client'

import React from 'react';
import { Heart, Sparkles, Server, ArrowRight, ShieldCheck } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import TestimonialCard from '../shared/TestimonialCard';
import ActionButton from '../shared/ActionButton';
import FooterLinkColumn from '../shared/FooterLinkColumn';

export default function FooterSection() {
  const testimonials = [
    {
      text: 'FreelanceOS replaced Notion for me. The visual Kanban revision counter has saved me countless arguments with clients about scope creep. Absolute game-changer.',
      author: 'Siddardha K.',
      role: 'High-Value Video Editor',
      tag: 'Video Production'
    },
    {
      text: 'The price-per-unit billing model is perfect. I bill per thumbnail designed. When I mark a task approved on the Kanban, my monthly ledger aggregates it instantly.',
      author: 'Aryan Sharma',
      role: 'YouTube Thumbnail Designer',
      tag: 'Design & Graphics'
    },
    {
      text: 'Data privacy was critical. Having dedicated database namespaces scoped via AES-256 cookies gives me absolute confidence that my billing contracts remain secure.',
      author: 'Neha Deshmukh',
      role: 'Brand Consultant & Designer',
      tag: 'Consulting'
    }
  ];

  const footerColumns = [
    {
      title: 'Workspace Module',
      links: [
        { label: 'Client CRM', href: '#features-tabs' },
        { label: 'Kanban Manager', href: '#features-tabs' },
        { label: 'Ledger Invoicing', href: '#features-tabs' },
        { label: 'Analytics Telemetry', href: '#features-tabs' }
      ]
    },
    {
      title: 'Security Schema',
      links: [
        { label: 'AES-256 Encryption', href: '#faq' },
        { label: 'PBKDF2 SHA-512', href: '#faq' },
        { label: 'Data Isolation', href: '#faq' },
        { label: 'Session Crypto Tags', href: '#faq' }
      ]
    },
    {
      title: 'System Diagnostics',
      links: [
        { label: 'MongoDB Telemetry', href: '/login' },
        { label: 'Cluster Config', href: '/login' },
        { label: 'Preflight Handshake', href: '#contact' },
        { label: 'Sandbox Wipe', href: '/login' }
      ]
    }
  ];

  return (
    <>
      {/* CREATORS TESTIMONIAL FEEDBACK WIDGET */}
      <section id="testimonials" className="py-32 bg-slate-50/60 border-t border-slate-200 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header utilizing shared subcomponent */}
          <SectionHeader 
            badge="Creator Endorsements"
            badgeIcon={Sparkles}
            title="Migrated Creators Speak Out"
            description="Real telemetry reviews from verified independent workspace operators."
            centered={true}
          />

          {/* Testimonials list utilizing shared subcomponents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* Call To Action (CTA) - Light Minimalist Workspace Provisioner Container */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto text-center relative">
        <div className="bg-white text-slate-950 rounded-[2.5rem] p-12 sm:p-20 border border-slate-200/80 shadow-2xl shadow-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-slate-50 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Header utilizing shared subcomponent */}
            <SectionHeader 
              badge="Instance Deployer v1.1"
              badgeIcon={Server}
              title="Organize Your Freelance Engine Today"
              description="Instantiate your private, database-isolated space now. Aggregate your contracts, active retentions, and live Kanban cards under absolute zero-dependency encryption."
              centered={true}
              className="!mb-10"
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ActionButton 
                href="/signup" 
                variant="primary" 
                icon={ArrowRight} 
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Deploy Workspace
              </ActionButton>
              
              <ActionButton 
                href="/login" 
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Enter Active Space
              </ActionButton>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-indigo-600" /> MongoDB Scoping</span>
              <span className="text-slate-300">•</span>
              <span>AES-256 Crypto Tags</span>
              <span className="text-slate-300">•</span>
              <span>Zero dependencies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Links Columns Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-16 border-b border-slate-100">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs uppercase tracking-widest text-white shadow-md shadow-indigo-100">
                  FO
                </div>
                <span className="font-black text-slate-900 uppercase tracking-widest text-xs">FreelanceOS</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
                The zero-dependency sandbox environment built specifically for creators, thumbnail designers, editors, and independent developers.
              </p>
            </div>

            {/* Reusable Links Columns utilizing shared subcomponents */}
            {footerColumns.map((col, idx) => (
              <FooterLinkColumn 
                key={idx}
                title={col.title}
                links={col.links}
              />
            ))}
          </div>

          {/* Bottom Copyright and Meta details */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Engineered with</span> <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> <span>for modern creators</span>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
              &copy; {new Date().getFullYear()} FreelanceOS. All rights reserved. Registered container console.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
