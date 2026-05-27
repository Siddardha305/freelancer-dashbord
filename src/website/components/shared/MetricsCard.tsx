'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export default function MetricsCard({
  label,
  value,
  description,
  icon: Icon,
  className = ''
}: MetricsCardProps) {
  return (
    <div className={`flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all duration-300 group ${className}`}>
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/80 group-hover:bg-indigo-950/30 transition-all w-fit mb-4">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-relaxed max-w-[200px]">{description}</p>
    </div>
  );
}
