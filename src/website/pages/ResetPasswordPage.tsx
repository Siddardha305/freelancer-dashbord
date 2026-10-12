'use client'

import React, { useActionState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/auth/actions/auth-actions';
import { KeyRound, ArrowLeft, Loader2, CheckCircle, ShieldX } from 'lucide-react';
import Logo from '@/components/Logo';

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>,
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  const isSuccess = state?.message === 'success';
  const errors = state?.errors as Record<string, string[]> | undefined;

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  if (!token) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto h-16 w-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center shadow-lg">
          <ShieldX className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Invalid Recovery Token</h2>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed">
            The password reset link is invalid, expired, or missing its verification token.
          </p>
        </div>

        <Link 
          href="/forgot-password"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#fe8e02] to-[#cb2100] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-lg shadow-[#cb2100]/25 active:scale-[0.98] transition-all cursor-pointer block text-center"
        >
          Request Fresh Link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuccess ? (
        <div className="space-y-6 text-center py-4">
          <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center shadow-lg">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Password Updated!</h2>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Your credentials have been securely updated. Redirecting to workspace login...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">Create New Password</h1>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Ensure your new password contains at least 8 characters.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="token" value={token} />

            {state?.message && state.message !== 'success' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {state.message}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                New Password
              </label>
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
                  className="w-full pl-12 pr-4 py-3.5 bg-[#070b16] border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#fe8e02] focus:ring-4 focus:ring-[#fe8e02]/15 transition-all shadow-inner"
                />
              </div>
              {errors?.password && (
                <p className="text-xs font-bold text-rose-400 mt-1">{errors.password[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4.5 w-4.5 shrink-0" />
                </div>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#070b16] border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-[#fe8e02] focus:ring-4 focus:ring-[#fe8e02]/15 transition-all shadow-inner"
                />
              </div>
              {errors?.confirmPassword && (
                <p className="text-xs font-bold text-rose-400 mt-1">{errors.confirmPassword[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#fe8e02] to-[#cb2100] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#cb2100]/25 hover:shadow-xl hover:shadow-[#fe8e02]/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Saving Password...
                </>
              ) : (
                "Update & Continue"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#060913] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden selection:bg-[#fe8e02]/30 selection:text-white">
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#fe8e02]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#cb2100]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto w-full max-w-md z-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#fe8e02] transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign In
          </Link>
          <Link href="/" className="inline-flex items-center">
            <Logo height={36} />
          </Link>
        </div>

        <div className="bg-[#0a0f1d]/90 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl">
          <Suspense fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#fe8e02]" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
