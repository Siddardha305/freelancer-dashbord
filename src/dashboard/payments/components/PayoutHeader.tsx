'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface PayoutHeaderProps {
  monthLabel: string;
  totalPayoutDue: number;
  totalPending: number;
  formatCurrency: (value: number | string) => string;
  timeframe: 'this_month' | 'last_month' | 'last_3m' | 'last_year';
  setTimeframe: (t: 'this_month' | 'last_month' | 'last_3m' | 'last_year') => void;
}

const tabs = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_3m', label: 'Last 3M' },
  { id: 'last_year', label: 'Last Year' }
] as const;

export function PayoutHeader({
  monthLabel,
  totalPayoutDue,
  totalPending,
  formatCurrency,
  timeframe,
  setTimeframe
}: PayoutHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/60 pb-5">
      <div className="space-y-1">
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
          Monthly Payout Summary
        </h2>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
          {monthLabel} · Updates every 8 seconds
        </p>
      </div>

      {/* Sliding Tab Selector */}
      <div className="flex bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-800/80 gap-1 select-none self-start lg:self-auto">
        {tabs.map((tab) => {
          const isActive = timeframe === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`relative px-4 py-2 text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition-colors duration-200 cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePayoutTab"
                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/20 dark:border-slate-700/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary Totals & Action */}
      <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
        <div className="px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center min-w-[100px]">
          <p className="text-[9px] font-black text-emerald-500 dark:text-emerald-450 uppercase tracking-widest mb-0.5">
            Total Earned
          </p>
          <p className="text-base font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totalPayoutDue)}
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-center min-w-[100px]">
          <p className="text-[9px] font-black text-amber-500 dark:text-amber-450 uppercase tracking-widest mb-0.5">
            In Pipeline
          </p>
          <p className="text-base font-black text-amber-700 dark:text-amber-400 tracking-tight">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>
    </div>
  );
}
