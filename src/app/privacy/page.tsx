'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import { Shield } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function PrivacyPage() {
  return (
    <WebsitePageLayout>
      <div className="py-32 max-w-4xl mx-auto px-6 sm:px-12 relative">
        {/* Glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center mb-16">
          <TechBadge 
            label="Privacy Protection" 
            icon={Shield} 
            variant="indigo" 
            className="mb-6"
          />

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            Privacy <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Policy</span>
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
              1. Introduction
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              At FreelanceOS, we prioritize your privacy above all else. This Privacy Policy details the types of personal data we collect, how it is processed, stored, and the measures we deploy to ensure its strict security. By using our platform, you consent to the data practices described in this policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              2. Information We Collect
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              We only collect data essential for the optimal functioning of your workspace. This includes:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li><strong className="text-white">Account Details:</strong> Your name, email, workspace settings, profile preferences, and subscription choices.</li>
              <li><strong className="text-white">Business Intelligence:</strong> Client directories, milestone summaries, task boards, and payment ledgers that you input into the private workspace dashboard.</li>
              <li><strong className="text-white">System Diagnostics:</strong> IP address, device telemetry, browser type, and page activity logs to assist in performance optimization and troubleshooting.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              3. How We Use Your Information
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              The data we gather is strictly used to run the platform and protect your workspace. We utilize your details to:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li>Provision and manage your private workspace.</li>
              <li>Deliver secure visual client portals and generate PDF ledger reports.</li>
              <li>Send critical onboarding communications, security alerts, and system notifications.</li>
              <li>Improve service quality by analyzing diagnostic analytics in aggregate.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              4. Data Isolation and Storage
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              Your business operations are yours alone. All records, transactions, ledgers, and portal credentials are dynamically isolated using modern schema parameters. We store database information in secured database clusters utilizing industry-leading cloud hosts, ensuring that your records are never co-mingled or visible to other users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              5. Third-Party Services
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              We leverage trusted cloud providers to assist in running the application:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li><strong className="text-white">Authentication:</strong> Secure authentication tokens to sign you in safely.</li>
              <li><strong className="text-white">Email Service:</strong> Transactional communications generated securely via Resend.</li>
              <li><strong className="text-white">Database Hosting:</strong> Highly available data servers with automatic backups and real-time clustering.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              6. Your Rights and Preferences
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              You retain full control over your data. At any time, you can access, export, or permanently delete your account data directly from the system console setting panel. We honor all requests for data portability and deletion.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-8">
            <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
              Should you have any questions regarding your data safety, please reach out directly via our Support portal.
            </p>
          </section>
        </div>
      </div>
    </WebsitePageLayout>
  );
}
