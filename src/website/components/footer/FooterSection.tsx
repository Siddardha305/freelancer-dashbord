'use client'

import React from 'react';
import { Heart } from 'lucide-react';
import FooterLinkColumn from '../shared/FooterLinkColumn';
import Link from 'next/link';

export default function FooterSection() {
  const footerColumns = [
    {
      title: 'Platform Modules',
      links: [
        { label: 'Client CRM', href: '/tour' },
        { label: 'Kanban Board', href: '/tour' },
        { label: 'Smart Ledgers', href: '/tour' },
        { label: 'PDF Reports', href: '/tour' }
      ]
    },
    {
      title: 'Privacy & Security',
      links: [
        { label: 'Secure Isolation', href: '/faqs' },
        { label: 'Bank-Grade Encryption', href: '/faqs' },
        { label: 'Data Safety', href: '/faqs' },
        { label: 'Private Accounts', href: '/faqs' }
      ]
    },
    {
      title: 'Product',
      links: [
        { label: 'Sign In', href: '/login' },
        { label: 'Start Workspace', href: '/signup' },
        { label: 'Contact Support', href: '/contact' },
        { label: 'Reset Password', href: '/login' }
      ]
    }
  ];

  return (
    <footer className="bg-transparent border-t border-slate-900/60 px-6 sm:px-12 pt-16 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Links Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900/60">
          {/* Brand column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs uppercase tracking-widest text-white shadow-md shadow-indigo-600/20">
                FO
              </div>
              <span className="font-black text-white uppercase tracking-widest text-xs">FreelanceOS</span>
            </Link>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs">
              The ultimate professional workspace built specifically for independent creators, designers, editors, and freelance professionals.
            </p>
            <Link
              href="/signup"
              className="inline-block text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-indigo-900/40 transition-all"
            >
              Get Started Free →
            </Link>
          </div>

          {/* Reusable Links Columns */}
          {footerColumns.map((col, idx) => (
            <FooterLinkColumn
              key={idx}
              title={col.title}
              links={col.links}
            />
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Engineered with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for modern creators</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">
            &copy; {new Date().getFullYear()} FreelanceOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
