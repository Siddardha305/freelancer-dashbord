'use client'

import React from 'react';
import Navbar from '../navbar/Navbar';
import FooterSection from '../footer/FooterSection';

interface WebsitePageLayoutProps {
  children: React.ReactNode;
}

export default function WebsitePageLayout({ children }: WebsitePageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative">
      
      {/* Premium Dashboard Subtle Grid Background (Dark Slate) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111625_1px,transparent_1px),linear-gradient(to_bottom,#111625_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_80%,transparent_100%)] opacity-80 pointer-events-none -z-10" />

      {/* Floating Pill Console Navbar */}
      <Navbar />

      {/* Standard page wrapper with top spacing to clear fixed navbar */}
      <main className="relative">
        {children}
      </main>

      {/* Shared SaaS footer */}
      <FooterSection />
      
    </div>
  );
}
