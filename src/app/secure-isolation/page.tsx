'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import { Shield } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function SecureIsolationPage() {
  return (
    <WebsitePageLayout>
      <div className="py-32 max-w-4xl mx-auto px-6 sm:px-12 relative">
        {/* Glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center mb-16">
          <TechBadge 
            label="Infrastructure Security" 
            icon={Shield} 
            variant="emerald" 
            className="mb-6"
          />

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            Secure Data <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">Isolation</span>
          </h1>
          
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">
            FreelanceOS Enterprise Standards
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative z-10 space-y-10">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
              Overview of Tenant Isolation
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              At FreelanceOS, security is built into our core database topology. We operate a highly isolated tenancy framework, meaning every workspace account resides in a logically separate database sandbox. Under no circumstances can queries from one user account access or inspect data belonging to another workspace tenant.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
              How Isolated Sandbox Works
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              Our infrastructure separates workspace data at three critical layers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-950/60 border border-slate-800/60 p-6 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-white">1. Query-Level Separation</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Every SQL/NoSQL transaction executed on our clusters is automatically validated by an active tenant middleware checking session security hashes.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/60 p-6 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-white">2. Tokenized Storage Boundaries</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Static assets, thumbnail uploads, PDF invoices, and CSV spreadsheet reports are stored under specific tokenized directory paths protected by access control policies.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/60 p-6 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-white">3. Isolated Client Portals</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Client-facing delivery interfaces operate on isolated sub-routes. Access requires signature-validated tokens that cannot be simulated or reverse-engineered.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/60 p-6 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-white">4. API Request Sanitization</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  All request payloads are strictly validated against runtime schemas (Zod validators) to stop database injection and prototype pollution.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
              Automated Backups & Redundancy
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              Isolated backups are executed automatically on a daily basis. Every sandbox is snapshotted and encrypted before being securely transferred to offsite storage vaults. In the event of network disruption, workspaces can be restored to a specific minute in history without affecting the logs of other accounts.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-8">
            <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
              Our isolation design guarantees that your business intelligence remains entirely private and secure at all times.
            </p>
          </section>
        </div>
      </div>
    </WebsitePageLayout>
  );
}
