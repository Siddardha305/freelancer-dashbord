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
  formatCurrency: (value: number | string) => string;
}

export function WorkStatistics({
  stats,
  completionRate,
  earnedToday,
  pendingTasksCount,
  inProgressTasksCount,
  formatCurrency
}: WorkStatisticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Scope" value={stats.total} icon={LayoutGrid} />
        <StatCard title="Urgent Action" value={stats.urgent} alert={stats.urgent > 0} icon={Zap} />
        <StatCard title="Success Rate" value={`${completionRate}%`} icon={CheckCircle2} />
      </div>
      
      {/* Today's Work Summary Card */}
      <div className="glass-bg p-5 rounded-[2rem] border border-card-border flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:scale-110 transition-transform">
          <Zap className="h-16 w-16 text-indigo-600 animate-pulse" />
        </div>
        <div>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Today&apos;s Pulse</p>
          <h4 className="text-lg font-black text-slate-950 tracking-tight mb-3">Today&apos;s Work</h4>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50/70 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Earned</span>
              <span className="text-xs font-black text-emerald-600 mt-1 truncate">{formatCurrency(earnedToday)}</span>
            </div>
            
            <div className="bg-slate-50/70 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Pending</span>
              <span className="text-xs font-black text-amber-600 mt-1 truncate">{pendingTasksCount}</span>
            </div>
            
            <div className="bg-slate-50/70 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between transition-colors shadow-sm">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Active</span>
              <span className="text-xs font-black text-indigo-600 mt-1 truncate">{inProgressTasksCount}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center text-[9px] font-bold border-t border-slate-100/80 pt-2.5">
          <span className="text-indigo-600">Active Pipeline</span>
          <span className="text-slate-400 font-medium">{format(new Date(), 'EEEE, MMM dd')}</span>
        </div>
      </div>
    </div>
  );
}
