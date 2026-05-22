'use client'

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 py-4 flex justify-center pointer-events-none">
      <header className="w-full max-w-6xl pointer-events-auto h-16 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-full px-6 sm:px-8 flex items-center justify-between shadow-lg shadow-slate-100/50 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-slate-200/40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-600/20">
              F
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 leading-none">FreelanceOS</span>
              <div className="text-[8px] font-black text-indigo-600 tracking-[0.2em] uppercase leading-none mt-0.5">Workspace</div>
            </div>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <a href="#features-tabs" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Tour</a>
          <a href="#contact" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Contact</a>
          <a href="#faq" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl sm:rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            Get Started
          </Link>
        </div>
      </header>
    </div>
  );
}
