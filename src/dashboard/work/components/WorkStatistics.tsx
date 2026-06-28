'use client'

import React from 'react';
import { LayoutGrid, Zap, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { format } from "date-fns";

interface WorkStatisticsProps {
  stats: {
    total: number;
    completed: number;
    urgent: number;
    weekly: number;
  };
  completionRate: number;
  earnedToday: number;
  pendingTasksCount: number;
  inProgressTasksCount: number;
  pendingOverallCount: number;
  formatCurrency: (value: number | string) => string;
  isEditor?: boolean;
  completedTodayCount?: number;
}

export function WorkStatistics({
  stats,
  completionRate,
  earnedToday,
  pendingTasksCount,
  inProgressTasksCount,
  pendingOverallCount,
  formatCurrency,
  isEditor = false,
  completedTodayCount = 0
}: WorkStatisticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Today's Work Summary Card - rendered FIRST */}
      <div className="glass-bg p-5 rounded-[2rem] border border-card-border flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:scale-110 transition-transform">
          <Zap className="h-16 w-16 text-indigo-600 animate-pulse" />
        </div>
        <div>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Today&apos;s Pulse</p>
          <h4 className="text-lg font-black text-slate-950 dark:text-white tracking-tight mb-3">Today&apos;s Work</h4>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">{isEditor ? "Done Today" : "Earned"}</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">{isEditor ? completedTodayCount : formatCurrency(earnedToday)}</span>
            </div>
            
            <div className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">Pending</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 truncate">{pendingTasksCount}</span>
            </div>
            
            <div className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight">Active</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1 truncate">{inProgressTasksCount}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center text-[9px] font-bold border-t border-slate-100/80 dark:border-slate-800/80 pt-2.5">
          <span className="text-indigo-600 dark:text-indigo-400">Active Pipeline</span>
          <span className="text-slate-400 dark:text-slate-550 font-medium">{format(new Date(), 'EEEE, MMM dd')}</span>
        </div>
      </div>

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Urgent Action" value={pendingOverallCount} alert={pendingOverallCount > 0} icon={Zap} />
        <StatCard title="Total Scope" value={stats.total} icon={LayoutGrid} />
        <StatCard title="Success Rate" value={`${completionRate}%`} icon={CheckCircle2} />
      </div>
    </div>
  );
}
