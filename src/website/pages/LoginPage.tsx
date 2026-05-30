'use client'

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/auth/actions/auth-actions';
import { KeyRound, Mail, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground, AnimatedCard } from '../components/ui/AnimateUI';

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>,
};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.message === 'success') {
      // Force page reload to ensure the root layout checks the session fresh
      window.location.href = '/dashboard';
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch overflow-hidden font-sans">
      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white relative z-10">
        <div className="absolute top-8 left-8 sm:left-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">FreelanceOS</span>
            </div>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm space-y-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Access your professional workspace</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.message && state.message !== 'success' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {state.message}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5 shrink-0" />
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs font-bold text-rose-500 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5 shrink-0" />
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs font-bold text-rose-500 mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Sign Up Free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Beautiful visual brand card panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 to-indigo-950 p-16 items-center justify-center relative overflow-hidden">
        {/* Decorative Grid Overlay & Light blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
        <AnimatedBackground className="opacity-30" />
        
        <div className="relative max-w-md text-white text-center space-y-8 z-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-xl mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Security-first workspace isolation
          </h2>
          
          <p className="text-indigo-200/80 font-medium text-sm leading-relaxed">
            FreelanceOS houses your business intelligence securely. Add new workspaces, verify contracts, log visual thumbnail tasks, and balance payments safely within your custom isolated account.
          </p>

          {/* Micro-testimonial element */}
          <AnimatedCard className="p-6 rounded-[2rem] bg-indigo-950/40 border border-indigo-800/40 text-left space-y-3 backdrop-blur-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="h-4.5 w-4.5 text-amber-400 fill-amber-400 shrink-0" />
              ))}
            </div>
            <p className="text-xs font-semibold italic text-indigo-100/90 leading-relaxed">
              &quot;Switching my thumbnail design studio to FreelanceOS transformed my team. Multi-user accounts let my designers visual-map workflows and log bank payments privately in real-time.&quot;
            </p>
            <div>
              <p className="text-xs font-bold text-white">Siddardha Reddy</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Creative Director</p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
