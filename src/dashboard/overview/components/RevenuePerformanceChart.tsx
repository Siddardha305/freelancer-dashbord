'use client'

import React from 'react';
import { TrendingUp } from "lucide-react";

interface RevenuePerformanceChartProps {
  thisMonthRevenue: number;
  formatCurrency: (value: number | string) => string;
}

export function RevenuePerformanceChart({ thisMonthRevenue, formatCurrency }: RevenuePerformanceChartProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Revenue Performance</h2>
          <p className="text-xs text-slate-500 font-medium">Monthly collection trends</p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-end justify-between h-56 gap-2 sm:gap-4">
        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, i) => {
          const height = thisMonthRevenue > 0 ? (30 + (i * 12)) : 10; 
          const currentMockVal = Math.round(thisMonthRevenue / 6 * (i + 1));
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
              <div className="w-full flex flex-col justify-end items-center h-full">
                <div 
                  className="w-full max-w-[40px] bg-slate-100 rounded-2xl transition-all duration-300 group-hover/bar:bg-indigo-600 group-hover/bar:scale-105 relative group/tip"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                    {formatCurrency(currentMockVal)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider group-hover/bar:text-indigo-600 transition-colors">{month}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
