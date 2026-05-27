'use client'

import React from 'react';
import { CheckCircle2, CreditCard, Calendar } from "lucide-react";
import { Client } from "@/types/client";
import { Work } from "@/types/work";

interface ClientActivitySidebarProps {
  client: Client;
  healthScore: number;
  clientTasks: Work[];
  currentTimestamp: number;
}

export function ClientActivitySidebar({
  client,
  healthScore,
  clientTasks,
  currentTimestamp
}: ClientActivitySidebarProps) {
  return (
    <div className="space-y-8">
      {/* Health Score */}
      <div className="premium-card rounded-[2rem] p-6 sm:p-8">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Client Health Score</h3>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tighter">{healthScore}%</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg ${healthScore > 70 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
              {healthScore > 70 ? 'Excellent' : 'Needs Attention'}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${healthScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed">
            Score calculated based on payment punctuality, project activity, and communication frequency.
          </p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="premium-card rounded-[2rem] p-6 sm:p-8 space-y-4 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Activity Snapshot</h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-indigo-600">
                <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">Tasks Done</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{clientTasks.filter((t: Work) => t.status as string === 'Completed' || t.status === 'Done').length}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-emerald-600">
                <CreditCard className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">Active Tasks</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{clientTasks.filter((t: Work) => t.status === 'In Progress').length}</span>
          </div>

          <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-amber-600">
                <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">Last Activity</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-900">
              {(() => {
                const sortedTasks = [...clientTasks].sort((a: Work, b: Work) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
                const lastTask = sortedTasks[0];
                if (!lastTask) return 'No tasks yet';
                const diff = Math.floor((currentTimestamp - new Date(lastTask.updatedAt || lastTask.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="premium-card rounded-[2rem] p-6 sm:p-8">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Client Tags</h3>
        <div className="flex flex-wrap gap-2">
          {client.tags && client.tags.length > 0 ? client.tags.map((tag: string) => (
            <span key={tag} className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-default">
              #{tag}
            </span>
          )) : (
            <p className="text-xs text-slate-400 italic">No tags assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
