'use client'

import React, { useState } from 'react';
import { Heart, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="3" height="8" x="13" y="2" rx="1.5" />
    <path d="M19 8.5a1.5 1.5 0 1 1-3 0V7a1.5 1.5 0 1 1 3 0z" />
    <rect width="3" height="8" x="8" y="14" rx="1.5" />
    <path d="M5 15.5a1.5 1.5 0 1 1 3 0V17a1.5 1.5 0 1 1-3 0z" />
    <rect width="8" height="3" x="2" y="13" rx="1.5" />
    <path d="M7 8.5a1.5 1.5 0 1 1 0 3H8.5a1.5 1.5 0 1 1 0-3z" />
    <rect width="8" height="3" x="14" y="8" rx="1.5" />
    <path d="M17 12.5a1.5 1.5 0 1 1 0 3H15.5a1.5 1.5 0 1 1 0-3z" />
  </svg>
);

export default function FooterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const platformLinks = [
    { label: 'Client CRM', href: '/tour' },
    { label: 'Kanban Board', href: '/tour' },
    { label: 'Smart Ledgers', href: '/tour' },
    { label: 'PDF Reports', href: '/tour' },
  ];

  const privacyLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Secure Isolation', href: '/secure-isolation' },
    { label: 'Bank-Grade Encryption', href: '/bank-grade-encryption' },
  ];

  const productLinks = [
    { label: 'Sign In', href: '/login' },
    { label: 'Start Workspace', href: '/signup' },
    { label: 'Contact Support', href: '/contact' },
    { label: 'Reset Password', href: '/login' },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 px-6 sm:px-12 py-20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-[200px] left-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 pb-16 border-b border-slate-900">
          {/* Logo & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-sm uppercase tracking-widest text-white shadow-lg shadow-indigo-600/10">
                FO
              </div>
              <span className="font-extrabold text-white tracking-wide text-sm uppercase">FreelanceOS</span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The ultimate professional workspace built specifically for independent creators, designers, editors, and freelance professionals.
            </p>

            {/* Newsletter */}
            <div className="space-y-3 pt-2 max-w-sm">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                Stay updated
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/40 border border-slate-800/80 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/15 shrink-0"
                >
                  {subscribed ? 'Subscribed!' : 'Join'}
                  {!subscribed && <ArrowRight className="h-3 w-3" />}
                </button>
              </form>
              <p className="text-[10px] text-slate-500">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Platform Modules Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Platform Modules</h4>
              <ul className="space-y-3">
                {platformLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy & Security Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Privacy & Security</h4>
              <ul className="space-y-3">
                {privacyLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Column */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Product</h4>
              <ul className="space-y-3">
                {productLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Heart label */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Engineered with</span>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>for modern creators</span>
          </div>

          {/* Copyright & Socials */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors p-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg">
                <GithubIcon className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors p-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="https://slack.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors p-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg">
                <SlackIcon className="h-4 w-4" />
              </a>
            </div>

            <p className="text-xs text-slate-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} FreelanceOS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
