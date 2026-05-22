'use client'

import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface FeatureSidebarButtonProps {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export default function FeatureSidebarButton({
  title,
  description,
  badge,
  icon: Icon,
  isActive,
  onClick
}: FeatureSidebarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-[1.5rem] border transition-all duration-300 flex items-start gap-4 cursor-pointer group outline-none focus:ring-1 focus:ring-indigo-500/50 ${
        isActive 
          ? 'bg-white border-slate-200 shadow-xl shadow-slate-100/50' 
          : 'bg-transparent border-transparent hover:bg-white/40 hover:border-slate-200/50'
      }`}
    >
      <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center border transition-all ${
        isActive 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'bg-white border-slate-200 text-slate-400 group-hover:text-slate-900 group-hover:border-slate-300'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h3 className={`text-sm font-black tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
            {title}
          </h3>
          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
            isActive 
              ? 'bg-indigo-50 border-indigo-100 text-indigo-750' 
              : 'bg-slate-100/80 border-slate-200 text-slate-400'
          }`}>
            {badge}
          </span>
        </div>
        <p className="text-[11px] text-slate-455 text-slate-400 font-bold uppercase tracking-wide leading-relaxed">
          {description}
        </p>
      </div>
      
      <ChevronRight className={`h-4 w-4 shrink-0 self-center text-slate-300 transition-transform ${
        isActive ? 'translate-x-0.5 text-indigo-600' : 'opacity-0 group-hover:opacity-100'
      }`} />
    </button>
  );
}
