'use client'

import React, { useActionState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/auth/actions/auth-actions';
import { KeyRound, ArrowLeft, Loader2, CheckCircle, ShieldAlert, ShieldX } from 'lucide-react';

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
        <div className="mx-auto h-16 w-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-50">
          <ShieldX className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Invalid Recovery Token</h2>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            The password reset link is invalid, malformed, or missing its security token.
          </p>
        </div>

        <Link 
          href="/forgot-password"
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all cursor-pointer block text-center"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <>
      {isSuccess ? (
        <div className="space-y-6 text-center py-4">
          <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-50">
            <CheckCircle className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Password Updated!</h2>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
              Your password has been successfully reset. You are now being redirected to the login portal...
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to login
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Configure Password</h1>
            <p className="text-sm font-semibold text-slate-400">Establish a new, secure password for your workspace</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.message && state.message !== 'success' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
                {state.message}
              </div>
            )}

            {/* Hidden Token Input */}
            <input type="hidden" name="token" value={token} />

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">New Password</label>
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
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
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto w-full max-w-md z-10 px-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Sign In
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-200">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">FreelanceOS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-100/50 p-8 sm:p-10 relative overflow-hidden">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validating Token...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
