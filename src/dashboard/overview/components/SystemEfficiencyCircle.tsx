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
    <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-10 left-10 p-3 rounded-2xl bg-indigo-50 text-indigo-600">
        <Zap className="h-5 w-5" />
      </div>
      
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-8">System Efficiency</h2>
      
      <div className="relative h-48 w-48 mb-8">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
          <circle 
            className="text-indigo-600 stroke-current" 
            strokeWidth="8" 
            strokeLinecap="round" 
            cx="50" cy="50" r="42" 
            fill="transparent" 
            strokeDasharray="263.8" 
            strokeDashoffset={dashOffset} 
            transform="rotate(-90 50 50)" 
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-slate-900 tracking-tighter">{completionRate}%</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Completed</span>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 font-medium max-w-[200px]">Overall project delivery success rate for active clients.</p>
    </div>
  );
}
