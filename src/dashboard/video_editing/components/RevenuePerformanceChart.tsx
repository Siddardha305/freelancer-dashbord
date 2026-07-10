'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from "framer-motion";
import { Work } from "@/types/work";
import { Client } from "@/types/client";

interface RevenuePerformanceChartProps {
  works: Work[];
  clients: Client[];
  formatCurrency: (value: number | string) => string;
}

type Timeframe = 'month' | '3m' | '6m' | 'year';

export function RevenuePerformanceChart({ works, clients, formatCurrency }: RevenuePerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('6m');

  // Build a lookup map of client name to client object
  const clientMap = useMemo(() => {
    const map: Record<string, Client> = {};
    clients.forEach((c) => {
      map[c.name] = c;
    });
    return map;
  }, [clients]);

  // Helper: get effective price per task based on client contract rate
  const getPricePerTask = useCallback((work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.status === "Inactive") return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  }, [clientMap]);

  // Generate data points depending on selected timeframe
  const data = useMemo(() => {
    const now = new Date();

    if (timeframe === 'month') {
      // Current Month: split by weeks
      const weeks = [
        { label: 'W1', start: 1, end: 7 },
        { label: 'W2', start: 8, end: 14 },
        { label: 'W3', start: 15, end: 21 },
        { label: 'W4', start: 22, end: 28 },
        { label: 'W5', start: 29, end: 31 },
      ];

      return weeks.map((wk) => {
        const completedInWeek = works.filter((w) => {
          if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
          const dateStr = w.completedAt || w.updatedAt || w.createdAt;
          if (!dateStr) return false;
          const compDate = new Date(dateStr);
          return (
            compDate.getMonth() === now.getMonth() &&
            compDate.getFullYear() === now.getFullYear() &&
            compDate.getDate() >= wk.start &&
            compDate.getDate() <= wk.end
          );
        });

        const revenue = completedInWeek.reduce(
          (acc, w) => acc + getPricePerTask(w), 0
        );

        return { label: wk.label, revenue };
      });
    }

    // rolling months: 3 months, 6 months, or 12 months (1 year)
    const monthCount = timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : 12;

    return Array.from({ length: monthCount }).map((_, index) => {
      const d = new Date();
      d.setDate(1); // Set to 1st of the month to prevent JS month overflow bugs on day 29/30/31
      d.setMonth(d.getMonth() - (monthCount - 1 - index));
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      const label = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();

      const completedInMonth = works.filter((w) => {
        if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
        const dateStr = w.completedAt || w.updatedAt || w.createdAt;
        if (!dateStr) return false;
        const compDate = new Date(dateStr);
        return compDate.getMonth() === targetMonth && compDate.getFullYear() === targetYear;
      });

      const revenue = completedInMonth.reduce(
        (acc, w) => acc + getPricePerTask(w), 0
      );

      return { label, revenue };
    });
  }, [timeframe, works, getPricePerTask]);

  // Find maximum revenue for scaling bar heights, default to 0
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.revenue), 0);
  }, [data]);

  const tabs = [
    { id: 'month', label: 'Monthly' },
    { id: '3m', label: 'Last 3M' },
    { id: '6m', label: 'Last 6M' },
    { id: 'year', label: 'Last Year' }
  ] as const;

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.2rem] p-10 border border-slate-200/60 dark:border-slate-800/80 shadow-sm dark:shadow-none group hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none transition-all duration-300 h-full flex flex-col justify-between cursor-default">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1.5 mt-2">Revenue Performance</h2>
          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Monthly collection trends</p>
        </div>
        
        {/* Sleek Sliding Tab Selector */}
        <div className="flex bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200/30 dark:border-slate-800/80 gap-1 select-none">
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
                    layoutId="activeRevenueTab"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/20 dark:border-slate-700/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex items-end justify-between h-56 ${data.length > 6 ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-4'}`}>
        {data.map((item, i) => {
          // Scale height between 10% and 90% (leaving room for tooltip)
          const height = maxRevenue > 0 
            ? Math.max(10, Math.round((item.revenue / maxRevenue) * 80) + 10) 
            : 10;

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar select-none">
              <div className="w-full h-40 flex flex-col justify-end items-center">
                <div 
                  className={`w-full bg-slate-100/75 dark:bg-slate-800/60 rounded-2xl transition-all duration-300 group-hover/bar:bg-gradient-to-t group-hover/bar:from-indigo-600 group-hover/bar:to-indigo-450 dark:group-hover/bar:from-indigo-500 dark:group-hover/bar:to-violet-500 group-hover/bar:scale-105 group-hover/bar:shadow-lg group-hover/bar:shadow-indigo-500/10 dark:group-hover/bar:shadow-none relative group/tip ${
                    data.length > 6 ? 'max-w-[24px] sm:max-w-[32px]' : 'max-w-[40px]'
                  }`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] font-black px-3.5 py-2.5 rounded-2xl opacity-0 group-hover/bar:opacity-100 transition-all duration-250 ease-out whitespace-nowrap shadow-xl z-20 border border-slate-850 backdrop-blur-xs pointer-events-none -translate-y-2 group-hover/bar:translate-y-0 uppercase tracking-widest">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              </div>
              <span className={`mt-4 text-[9px] text-slate-400 dark:text-slate-500 font-extrabold tracking-widest group-hover/bar:text-indigo-600 dark:group-hover/bar:text-indigo-400 transition-colors uppercase ${
                data.length > 6 ? 'scale-95' : ''
              }`}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>

  );
}


