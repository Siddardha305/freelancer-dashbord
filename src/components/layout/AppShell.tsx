'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { PlanProvider } from '@/context/PlanContext'
import { Menu, X } from 'lucide-react'
import { AnimatedThemeToggler } from '@/components/shared/AnimatedThemeToggler'

interface AppShellProps {
  children: React.ReactNode
  user?: {
    id: string
    name: string
    email: string
    role?: string
    currency?: string
    plan?: string
    agencyName?: string
    agencyLogoUrl?: string
    agencyLogoDarkUrl?: string;
    agencyBrandingMode?: string;
  } | null
}

export function AppShell({ children, user }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const isWhiteLabelEnabled = user?.plan === 'agency';
  const sidebarTitle = isWhiteLabelEnabled && user?.agencyName ? user.agencyName : "FreelanceOS";
  
  const brandingMode = isWhiteLabelEnabled ? (user?.agencyBrandingMode || "both") : "both";
  const customLogoUrl = isWhiteLabelEnabled
    ? (isDark && user?.agencyLogoDarkUrl ? user.agencyLogoDarkUrl : user?.agencyLogoUrl)
    : undefined;

  const showLogo = brandingMode === "logo" || brandingMode === "both";
  const showText = brandingMode === "text" || brandingMode === "both";

  return (
    <PlanProvider plan={user?.plan ?? 'hobby'}>
      <CurrencyProvider initialCurrency={user?.currency}>
        <div className="flex flex-col lg:flex-row h-screen w-full bg-gray-50/50 dark:bg-black overflow-hidden">
          
          {/* Mobile Header Bar */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              {showLogo && (
                customLogoUrl ? (
                  <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customLogoUrl} alt={sidebarTitle} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-md text-white shadow-md shrink-0">
                    {sidebarTitle.charAt(0).toUpperCase()}
                  </div>
                )
              )}
              
              {showText && (
                <span className="text-md font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate" title={sidebarTitle}>{sidebarTitle}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler className="h-9 w-9 p-2 border border-slate-200 dark:border-slate-850 rounded-xl" />
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-105 transition-all active:scale-95 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full shrink-0">
            <Sidebar user={user} />
          </div>

          {/* Mobile Sidebar Slide-Over Drawer */}
          {isMobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              {/* Drawer Content */}
              <div className="relative flex w-full max-w-[280px] flex-1 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl animate-in slide-in-from-left duration-300">
                {/* Close Button */}
                <div className="absolute top-5 right-4 z-10">
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Sidebar in drawer */}
                <Sidebar user={user} onLinkClick={() => setIsMobileSidebarOpen(false)} />
              </div>
            </div>
          )}

          <div className="flex flex-col flex-1 h-full min-w-0">
            <main className="flex-1 overflow-y-auto relative h-full">
              {children}
            </main>
          </div>
        </div>
      </CurrencyProvider>
    </PlanProvider>
  )
}

