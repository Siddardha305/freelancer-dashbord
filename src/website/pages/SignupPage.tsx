'use client'

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupAction } from '@/auth/actions/auth-actions';
import { KeyRound, Mail, User, ArrowRight, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground, AnimatedCard } from '../components/ui/AnimateUI';

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>,
};

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  const errors = state?.errors as Record<string, string[]> | undefined;

  useEffect(() => {
    if (state?.message === 'success') {
      // Force page reload to ensure the root layout checks the session fresh
      window.location.href = '/dashboard';
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch overflow-hidden font-sans">
      {/* Left side: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white relative z-10 overflow-y-auto">
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
          className="mx-auto w-full max-w-sm space-y-8 pt-10 pb-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Get Started</h1>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Create your professional space</p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.message && state.message !== 'success' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {state.message}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5 shrink-0" />
                </div>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {errors?.name && (
                <p className="text-xs font-bold text-rose-500 mt-1">{errors.name[0]}</p>
              )}
            </div>

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
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {errors?.email && (
                <p className="text-xs font-bold text-rose-500 mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Password</label>
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
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {errors?.password && (
                <p className="text-xs font-bold text-rose-500 mt-1">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-5 w-5 shrink-0" />
                </div>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
              {errors?.confirmPassword && (
                <p className="text-xs font-bold text-rose-500 mt-1">{errors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Registering Space...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Beautiful visual brand card panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 to-indigo-950 p-16 items-center justify-center relative overflow-hidden">
        {/* Decorative Grid Overlay & Light blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
        <AnimatedBackground className="opacity-30" />
        
        <div className="relative max-w-md text-white text-center space-y-8 z-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-xl mb-4">
            <Wand2 className="h-6 w-6" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Claim your new freelance operating space
          </h2>
          
          <p className="text-indigo-200/80 font-medium text-sm leading-relaxed">
            Register your email to instantiate a complete workspace container instantly. Track video edit thumbnails, niche pipelines, bank payouts, and invoice summaries in a highly customized database workspace.
          </p>

          {/* Micro-testimonial element */}
          <AnimatedCard className="p-6 rounded-[2rem] bg-indigo-950/40 border border-indigo-800/40 text-left space-y-3 backdrop-blur-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="h-4.5 w-4.5 text-amber-400 fill-amber-400 shrink-0" />
              ))}
            </div>
            <p className="text-xs font-semibold italic text-indigo-100/90 leading-relaxed">
              &quot;As a new user, starting with a clean slate allowed me to model my thumbnail pipeline perfectly. The diagnostics system makes testing and wiping tasks completely stress-free!&quot;
            </p>
            <div>
              <p className="text-xs font-bold text-white">Ananya Sharma</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Independent Animator</p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
