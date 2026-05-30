'use client'

import React from 'react';
import { LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="flex min-h-[4.5rem] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/40 backdrop-blur-md px-6 sm:px-12 py-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20 shadow-xs">
          <LayoutDashboard className="h-4.5 w-4.5" />
        </div>
        <h1 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
          Dashboard Overview
        </h1>
      </div>
      
      <div className="flex items-center gap-3.5">
        <div className="hidden sm:flex flex-col items-end mr-0.5">
          <span className="text-[9px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest">Signed in as</span>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100">{userName}</span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800/80 font-black text-slate-700 dark:text-slate-350 text-xs shadow-xs uppercase">
          {userName.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
}

