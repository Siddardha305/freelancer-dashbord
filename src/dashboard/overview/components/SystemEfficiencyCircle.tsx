'use client'

import React from 'react';
import { Zap } from "lucide-react";

interface SystemEfficiencyCircleProps {
  completionRate: number;
}

export function SystemEfficiencyCircle({ completionRate }: SystemEfficiencyCircleProps) {
  // Safe bounds calculation for circle offset
  const dashOffset = 263.8 - (263.8 * completionRate / 100);

  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.2rem] p-10 border border-slate-200/60 dark:border-slate-800/80 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 h-full cursor-default">
      <div className="absolute top-8 left-8 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20 group-hover:scale-105 transition-transform duration-300 shadow-xs">
        <Zap className="h-5 w-5" />
      </div>
      
      <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-10 mt-2">
        System Efficiency
      </h2>
      
      <div className="relative h-48 w-48 mb-8">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle className="text-slate-100 dark:text-slate-800/60 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
          <circle 
            className="text-indigo-600 dark:text-indigo-500 stroke-current" 
            strokeWidth="8" 
            strokeLinecap="round" 
            cx="50" cy="50" r="42" 
            fill="transparent" 
            strokeDasharray="263.8" 
            strokeDashoffset={dashOffset} 
            transform="rotate(-90 50 50)" 
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-450 transition-colors duration-250">{completionRate}%</span>
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-1">Completed</span>
        </div>
      </div>
      
      <p className="text-[11px] text-slate-500 dark:text-slate-450 font-bold max-w-[200px] leading-relaxed">
        Overall project delivery success rate calculated across all active client accounts.
      </p>
    </div>
  );
}

