'use client'

import React from 'react';

interface PayoutHeaderProps {
  monthLabel: string;
  totalPayoutDue: number;
  totalPending: number;
  formatCurrency: (value: number | string) => string;
}

export function PayoutHeader({
  monthLabel,
  totalPayoutDue,
  totalPending,
  formatCurrency
}: PayoutHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Monthly Payout Summary
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {monthLabel} · Updates every 8 seconds
        </p>
      </div>

      {/* Summary Totals */}
      <div className="flex items-center gap-4">
        <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">
            Total Earned
          </p>
          <p className="text-base font-black text-emerald-700 tracking-tight">
            {formatCurrency(totalPayoutDue)}
          </p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
            In Pipeline
          </p>
          <p className="text-base font-black text-amber-700 tracking-tight">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>
    </div>
  );
}
