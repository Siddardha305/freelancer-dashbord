'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { InteractiveHoverButton } from '../ui/InteractiveHoverButton';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const navLinks = [
    { label: 'Tour', href: '/tour' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQs', href: '/faqs' },
  ];

  return (
    <>
      {/* ── Floating Pill Navbar ── */}
      <div className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 py-4 flex justify-center pointer-events-none">
        <header className="w-full max-w-6xl pointer-events-auto h-16 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-full px-4 sm:px-8 flex items-center justify-between shadow-2xl shadow-slate-950/50 transition-all hover:bg-slate-950/80">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-transform shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-600/20">
              F
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white leading-none">FreelanceOS</span>
              <div className="text-[8px] font-black text-indigo-400 tracking-[0.2em] uppercase leading-none mt-0.5">Workspace</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : 'text-slate-400 hover:text-indigo-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors px-3 py-2 rounded-xl hover:bg-slate-900/60"
            >
              Sign In
            </Link>
            <InteractiveHoverButton href="/signup" className="py-2">
              Get Started
            </InteractiveHoverButton>
          </div>

          {/* Mobile: Sign In + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors px-3 py-2 rounded-xl hover:bg-slate-900/60"
            >
              Sign In
            </Link>
            <button
              onClick={() => setIsMobileOpen(prev => !prev)}
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all active:scale-95 cursor-pointer"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-[88px] inset-x-4 z-50 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden">

              {/* Nav Links */}
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="h-px bg-slate-800/60 mx-4" />

              {/* CTA Buttons */}
              <div className="p-4 space-y-3">
                <InteractiveHoverButton
                  href="/signup"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full py-3.5"
                >
                  Get Started — It&apos;s Free
                </InteractiveHoverButton>
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/40 text-sm font-bold uppercase tracking-wider transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
