'use client'

import React, { useState, useEffect } from 'react';
import { Sparkles, Calculator, FileText, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import { AnimatedCard } from '../ui/AnimateUI';

export default function NewFeaturesShowcase() {

  // AI Rate Calculator State
  const [niche, setNiche] = useState<'video' | 'design' | 'consulting'>('video');
  const [complexity, setComplexity] = useState<'standard' | 'premium'>('standard');
  const [animatedRate, setAnimatedRate] = useState(15000);

  // Telemetry Log lines
  const [logs, setLogs] = useState<string[]>([
    'Initializing secure isolation sandbox...',
    'Tenant authorization check: Passed (ID: workspace_user_449)',
    'Real-time WebSocket connection established'
  ]);

  // Handle calculator dynamics
  useEffect(() => {
    let target = 12000;
    if (niche === 'video') {
      target = complexity === 'standard' ? 18000 : 35000;
    } else if (niche === 'design') {
      target = complexity === 'standard' ? 8000 : 16000;
    } else {
      target = complexity === 'standard' ? 25000 : 50000;
    }

    const interval = setInterval(() => {
      setAnimatedRate(prev => {
        if (Math.abs(prev - target) < 500) {
          clearInterval(interval);
          return target;
        }
        return prev < target ? prev + 300 : prev - 300;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [niche, complexity]);

  // Rolling Telemetry Logs effect
  useEffect(() => {
    const logPool = [
      'Token signature check: verified encrypted payload',
      'Database sandbox replication completed successfully',
      'Encrypted PDF invoice dispatch queued via Resend API',
      'Client portal token generated: token_sha256_90f23a',
      'Performance audit: latency 18ms, CPU usage 4.2%',
      'SSL/TLS encryption handshake re-negotiated',
      'Database indexing optimized: client search returned in 2ms'
    ];

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [...prev.slice(-3), `[${timestamp}] ${randomLog}`]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 border-t border-slate-900/60 max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
      {/* Background radial flares */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <SectionHeader 
        badge="Platform Spotlight"
        badgeIcon={Sparkles}
        title="Advanced capabilities. Built for scale."
        description="Discover the newest features designed to automate client sign-offs, estimate premium rates, and provide enterprise-grade secure isolation."
        centered={true}
      />

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Card 1: AI Rate Estimator (6 cols) */}
        <AnimatedCard className="lg:col-span-6 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between">

          <div className="space-y-4 mb-8">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Smart Rate Estimator</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Price assets or projects using active market indicators. Calculate dynamic rates instantly based on complexity:
            </p>
          </div>

          {/* Calculator Widget */}
          <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex gap-2">
              {['video', 'design', 'consulting'].map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n as 'video' | 'design' | 'consulting')}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                    niche === n
                      ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-600/20'
                      : 'bg-transparent border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {n === 'video' ? 'Video' : n === 'design' ? 'Design' : 'Consult'}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
              <span className="text-[10px] font-extrabold text-slate-400">Project Quality/Tier</span>
              <div className="flex bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                <button
                  onClick={() => setComplexity('standard')}
                  className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-wider cursor-pointer ${
                    complexity === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setComplexity('premium')}
                  className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-wider cursor-pointer ${
                    complexity === 'premium' ? 'bg-slate-800 text-white animate-pulse' : 'text-slate-505'
                  }`}
                >
                  Premium
                </button>
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-4 flex flex-col items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Recommended Billing Rate</span>
              <p className="text-2xl font-black text-white mt-1 tracking-tight">₹{animatedRate.toLocaleString('en-IN')}</p>
              <span className="text-[9px] font-bold text-purple-400 bg-purple-950/40 border border-purple-900/20 px-2 py-0.5 rounded-full mt-2 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 fill-purple-400/20" /> Based on 2026 data
              </span>
            </div>
          </div>
        </AnimatedCard>

        {/* Card 2: Cryptographic Ledgers (6 cols) */}
        <AnimatedCard className="lg:col-span-6 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between">

          <div className="space-y-4 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Cryptographic Ledger PDFs</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Export cryptographic PDF reports that summarize client billing and invoice history. Perfect for income verification and tax logs.
            </p>
          </div>

          {/* Ledger Widget */}
          <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-2xl relative w-full overflow-hidden">
            <div className="flex justify-between items-start border-b border-slate-900 pb-3 mb-3">
              <div>
                <p className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="h-3 w-3" /> Signed Document
                </p>
                <p className="text-xs font-bold text-white mt-1">INV_LEGER_2026_Q2.pdf</p>
              </div>
              <span className="text-[7px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">SHA-256</span>
            </div>
            
            <div className="space-y-2 text-[9px] font-bold text-slate-400 leading-normal">
              <div className="flex justify-between">
                <span>Milestones Settled:</span>
                <span className="text-white">12 Items</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Billings (INR):</span>
                <span className="text-white">₹2,84,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-900/60 pt-2 text-[10px] font-black">
                <span className="text-white">Tax Withheld (1% TDS):</span>
                <span className="text-emerald-400">₹2,840</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Card 3: Secure Data Isolation Logs (12 cols) */}
        <AnimatedCard className="lg:col-span-12 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between">

          <div className="space-y-4 mb-8">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Active Tenant Sandboxing</h3>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              We separate client ledgers, tasks, and configuration files via queries dynamically scoped to your tenant workspace session. Your files are isolated and visible to you alone.
            </p>
          </div>

          {/* Logs Widget */}
          <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl w-full">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Security Audit Console</span>
            </div>

            <div className="space-y-2 font-mono text-[9px] leading-relaxed text-slate-400">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div
                    key={log}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <span className="text-indigo-500 select-none">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedCard>

      </div>
    </section>
  );
}
