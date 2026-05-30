'use client'

import React, { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/auth/actions/auth-actions';
import { Mail, ArrowLeft, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';

import { motion } from 'framer-motion';

const initialState = {
  message: '',
  errors: {} as Record<string, string[]>,
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  const isSuccess = state?.message === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto w-full max-w-md z-10 px-4"
      >
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
          {isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-50">
                <CheckCircle className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Link Sent Successfully!</h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  If that email is registered with us, a secure password recovery link has been dispatched to your inbox.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-500 text-left leading-relaxed">
                💡 <strong>Important Note:</strong> Secure links expire after exactly <strong>1 hour</strong>. If you do not receive the message within 5 minutes, please inspect your spam/junk folder.
              </div>

              <Link 
                href="/login"
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-slate-200 active:scale-[0.98] transition-all cursor-pointer block text-center"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Reset Password</h1>
                <p className="text-sm font-semibold text-slate-400">Enter your email to receive a secure recovery link</p>
              </div>

              <form action={formAction} className="space-y-6">
                {state?.message && state.message !== 'success' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                    <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Dispatched Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
