'use client'

import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { DollarSign } from "lucide-react";
import { AnimatedCard } from "@/website/components/ui/AnimateUI";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  alert?: boolean;
}

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  alert = false 
}: KpiCardProps) {
  const { symbol } = useCurrency();
  const isCurrencyIcon = Icon === DollarSign;

  // Curated premium HSL-derived color mappings for a luxurious aesthetic
  let colorTheme = {
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    text: 'text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20',
    glow: 'rgba(99, 102, 241, 0.08)',
    trend: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20',
    dot: 'bg-indigo-500'
  };

  if (title === "Total Clients") {
    colorTheme = {
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      text: 'text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20',
      glow: 'rgba(99, 102, 241, 0.08)',
      trend: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20',
      dot: 'bg-indigo-500'
    };
  } else if (title === "Active Projects") {
    colorTheme = {
      bg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
      text: 'text-cyan-600 dark:text-cyan-400 border border-cyan-100/30 dark:border-cyan-900/20',
      glow: 'rgba(6, 182, 212, 0.08)',
      trend: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20',
      dot: 'bg-cyan-500'
    };
  } else if (title === "Total Revenue") {
    colorTheme = {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/20',
      glow: 'rgba(16, 185, 129, 0.08)',
      trend: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
      dot: 'bg-emerald-500'
    };
  } else if (title === "Pending") {
    colorTheme = {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/20',
      glow: 'rgba(245, 158, 11, 0.08)',
      trend: 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
      dot: 'bg-amber-500'
    };
  } else if (title === "Delivered") {
    colorTheme = {
      bg: 'bg-violet-50/50 dark:bg-violet-950/20',
      text: 'text-violet-600 dark:text-violet-400 border border-violet-100/30 dark:border-violet-900/20',
      glow: 'rgba(139, 92, 246, 0.08)',
      trend: 'text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20',
      dot: 'bg-violet-500'
    };
  }

  return (
    <AnimatedCard 
      glowColor={colorTheme.glow}
      className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2.2rem] border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none group relative overflow-hidden h-full cursor-default"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`p-3.5 rounded-2xl ${colorTheme.bg} ${colorTheme.text} transition-transform duration-300 group-hover:scale-105 flex items-center justify-center shrink-0`}>
          {isCurrencyIcon ? (
            <span className="w-5 h-5 flex items-center justify-center text-base font-black leading-none select-none">{symbol}</span>
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="text-right min-w-0">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 truncate">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-250 truncate">{value}</p>
        </div>
      </div>
      
      <div className="mt-5 flex items-center">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${colorTheme.trend}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${colorTheme.dot} animate-pulse shrink-0`} />
          <span className="truncate">{trend}</span>
        </div>
      </div>
    </AnimatedCard>
  );
}




