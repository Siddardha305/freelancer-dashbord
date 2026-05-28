'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import { ShieldCheck } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function TermsPage() {
  return (
    <WebsitePageLayout>
      <div className="py-32 max-w-4xl mx-auto px-6 sm:px-12 relative">
        {/* Glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center mb-16">
          <TechBadge 
            label="Service Agreement" 
            icon={ShieldCheck} 
            variant="indigo" 
            className="mb-6"
          />

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            Terms of <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Service</span>
          </h1>
          
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">
            Last Updated: May 28, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative z-10 space-y-10">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              By registering an account and accessing FreelanceOS, you agree to comply with and be bound by the following Terms of Service. If you do not accept these terms in their entirety, you are prohibited from utilizing the platform or its integrated workspace modules.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              2. Workspace Accounts & Credentials
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              To utilize our workspace platform, you must establish an account. You represent and warrant that:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li>All registration info you submit is truthful, complete, and accurate.</li>
              <li>You are solely responsible for maintaining the confidentiality of your credentials and session cookies.</li>
              <li>You will immediately notify our support team of any unauthorized activity or suspected security breach.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              3. Subscription Plans, Billing & Cancellations
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              We offer both free tiers and premium monthly/yearly paid subscriptions:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li><strong className="text-white">Fees:</strong> All fees are stated in Indian Rupees (₹) and are processed via secure checkout channels.</li>
              <li><strong className="text-white">Auto-Renewal:</strong> Paid accounts will renew automatically based on your selected cycle (monthly/yearly) unless cancelled prior to the renewal date.</li>
              <li><strong className="text-white">Cancellations:</strong> You can cancel your subscription anytime via the billing console. Upon cancellation, your premium privileges remain active until the end of the paid billing period.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              4. Prohibited Content & Behavior
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              You agree not to use the platform to log, process, or deliver any illegal, offensive, or infringing media. Furthermore, you will not attempt to bypass database boundaries, intercept client portal session tokens, or launch distributed denial-of-service (DDoS) requests on our hosts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              5. Intellectual Property
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              All dashboard software designs, logo marks, brand themes, landing modules, and layout systems belong exclusively to FreelanceOS. The task documents, ledgers, client portals, files, and transaction details uploaded or generated by you remain your absolute intellectual property.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              6. Limitation of Liability
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              FreelanceOS is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. We disclaim all warranties, express or implied. Under no circumstances will FreelanceOS be liable for database disruptions, business interruptions, loss of client details, financial ledger inaccuracies, or secondary damages arising out of your use of the platform.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-8">
            <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
              Please review these terms periodically. Continued access of the platform represents automatic acceptance of any revised terms.
            </p>
          </section>
        </div>
      </div>
    </WebsitePageLayout>
  );
}
