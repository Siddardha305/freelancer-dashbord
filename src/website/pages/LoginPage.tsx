'use client'

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/auth/actions/auth-actions';
import { KeyRound, Mail, ArrowRight, Loader2, Sparkles, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.message === 'success') {
      // Force page reload to ensure the root layout checks the session fresh
      window.location.href = '/dashboard';
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-[#060913] flex items-stretch overflow-hidden font-sans text-slate-100 relative selection:bg-[#fe8e02]/30 selection:text-white">
      {/* Decorative Grid Overlay & Ambient Glow Meshes */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-br from-[#fe8e02]/15 to-[#cb2100]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-[#cb2100]/15 to-[#fe8e02]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-14 lg:px-20 py-12 relative z-10">
        <div className="absolute top-8 left-6 sm:left-14 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-[1.02]">
            <Logo height={44} />
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm space-y-8 pt-12 sm:pt-0"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fe8e02]/10 border border-[#fe8e02]/25 text-[#fe8e02] text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe8e02] animate-pulse" />
              Client Portal & Workspace Access
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sign in to manage your deliverables</p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.message && state.message !== 'success' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {state.message}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5 shrink-0" />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  placeholder="name@smartadverts.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0f1d]/90 border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#fe8e02] focus:ring-4 focus:ring-[#fe8e02]/15 transition-all shadow-inner"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs font-bold text-rose-400 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#fe8e02] hover:text-[#ffaa33] transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4.5 w-4.5 shrink-0" />
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0f1d]/90 border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#fe8e02] focus:ring-4 focus:ring-[#fe8e02]/15 transition-all shadow-inner"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs font-bold text-rose-400 mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#fe8e02] to-[#cb2100] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#cb2100]/25 hover:shadow-xl hover:shadow-[#fe8e02]/30 hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Enter Workspace <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#fe8e02] hover:text-[#ffaa33] font-black underline underline-offset-4 transition-colors">
              Sign Up Free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: SmartAdverts Brand Showcase Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0c1328] via-[#080d1c] to-[#04060d] p-16 items-center justify-center relative overflow-hidden border-l border-white/[0.08]">
        {/* Subtle decorative glow and radial lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#fe8e02_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#fe8e02]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-[#cb2100]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-lg text-white text-center space-y-8 z-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fe8e02]/10 border border-[#fe8e02]/30 text-[#fe8e02] shadow-2xl shadow-[#fe8e02]/20 mb-2">
            <Sparkles className="h-7 w-7" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-[#fe8e02] bg-clip-text text-transparent">
              High-Impact Visuals & Production Workspace
            </h2>
            
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-md mx-auto">
              SmartAdverts powers top creators and brands. Review high-CTR thumbnail concepts, track deliverable milestones, and monitor monthly payouts seamlessly.
            </p>
          </div>

          {/* Metric Highlights */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-[#fe8e02]" /> 100M+ Views Driven
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> High-CTR Design Strategy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-[#fe8e02]" /> Isolated Client Portals
            </span>
          </div>

          {/* Micro-testimonial element */}
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] text-left space-y-3 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-[#fe8e02]/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fe8e02]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="h-4 w-4 text-[#fe8e02] fill-[#fe8e02] shrink-0" />
              ))}
            </div>
            <p className="text-xs font-semibold italic text-slate-200 leading-relaxed">
              &quot;SmartAdverts transformed our entire YouTube thumbnail workflow. Our CTR jumped and having all tasks and billing organized here keeps delivery completely on schedule.&quot;
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div>
                <p className="text-xs font-bold text-white">Siddardha Reddy</p>
                <p className="text-[10px] font-bold text-[#fe8e02] uppercase tracking-widest mt-0.5">Creative Director, SmartAdverts</p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Verified Client</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
