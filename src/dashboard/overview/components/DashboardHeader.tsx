'use client'

import React from 'react';
import { LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-8 py-3 sm:py-4 flex-wrap">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end mr-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</span>
          <span className="text-sm font-semibold text-slate-900">{userName}</span>
        </div>
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 font-bold text-slate-700 text-sm">
          {userName.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
