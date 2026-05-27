'use client'

import React, { useActionState } from 'react';
import Link from 'next/link';
import { adminForgotPasswordAction } from '@/admin/actions/admin-actions';
import { ShieldCheck, Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const initialState = { message: '' };

export default function AdminForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(adminForgotPasswordAction, initialState);

  const sent = state?.message === 'success';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.015] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto w-full max-w-md z-10 px-4">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Admin Login
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/20">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">FreelanceOS Control</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-100/50 dark:shadow-none p-8 sm:p-10 transition-colors duration-300">
          {sent ? (
            /* Success State */
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Check Your Email</h2>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  If the email address is associated with an admin account, a password reset link has been sent. It expires in <strong>1 hour</strong>.
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all active:scale-[0.98]"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* Form State */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1">Forgot Password</h1>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Admin Account Recovery</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your admin email address and we&apos;ll send a password reset link to your inbox.
              </p>

              {state?.message && state.message !== 'success' && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  {state.message}
                </div>
              )}

              <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-5 w-5 shrink-0" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Sending Reset Link...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
