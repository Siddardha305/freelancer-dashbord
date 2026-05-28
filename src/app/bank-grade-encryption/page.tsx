'use client'

import React from 'react';
import WebsitePageLayout from '@/website/components/shared/WebsitePageLayout';
import { Lock } from 'lucide-react';
import TechBadge from '@/website/components/shared/TechBadge';

export default function BankGradeEncryptionPage() {
  return (
    <WebsitePageLayout>
      <div className="py-32 max-w-4xl mx-auto px-6 sm:px-12 relative">
        {/* Glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center mb-16">
          <TechBadge 
            label="Cryptographic Security" 
            icon={Lock} 
            variant="indigo" 
            className="mb-6"
          />

          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
            Bank-Grade <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Encryption</span>
          </h1>
          
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">
            FreelanceOS Cryptographic Standard
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative z-10 space-y-10">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              Cryptographic Safeguards
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              FreelanceOS employs industry-standard cryptography to safeguard your files, transaction records, client info, and session tokens. Our cryptographic guidelines align with modern bank-level transaction environments to block interception, spoofing, and decryption.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              Encryption in Transit
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              Every request between your browser and our workspace application is protected using Transport Layer Security (TLS 1.3). This establishes a heavily protected tunnel that prevents any middle-man interception of credentials, CSV data downloads, or webhook payloads.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              Encryption at Rest
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              All client ledgers, dashboard settings, database collections, and configuration logs are written to disk using Advanced Encryption Standard (AES-256). The encryption keys are managed securely and rotated automatically, ensuring that static raw database files are unreadable even in the event of direct physical drive recovery.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
              Session & Cookie Hardening
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-relaxed">
              Our authentication architecture utilizes cryptographic signing:
            </p>
            <ul className="space-y-2.5 pl-5 list-disc text-sm text-slate-400 font-semibold leading-relaxed">
              <li><strong className="text-white">HTTP-Only Protection:</strong> Client session tokens are locked to HTTP-Only cookies, rendering them inaccessible to cross-site scripting (XSS) attacks.</li>
              <li><strong className="text-white">Strict SameSite Control:</strong> Anti-CSRF tags prevent fraudulent browser queries from executing actions on behalf of your workspace.</li>
              <li><strong className="text-white">Secure Flag:</strong> Session cookies are transmitted exclusively over encrypted HTTPS requests.</li>
            </ul>
          </section>

          <section className="space-y-4 border-t border-slate-800/80 pt-8">
            <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
              Our cryptographic deployment guarantees that your data is safe and secured against unauthorized access.
            </p>
          </section>
        </div>
      </div>
    </WebsitePageLayout>
  );
}
