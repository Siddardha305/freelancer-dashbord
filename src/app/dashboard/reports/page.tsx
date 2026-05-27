'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  BarChart2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { getWorksAction } from '@/dashboard/work/actions/work-actions';
import { downloadCSV } from '@/lib/export-utils';
import { format } from 'date-fns';
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from '@/types/client';
import { Work } from '@/types/work';

export default function ReportsPage() {
  const { formatCurrency, symbol } = useCurrency();

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClientsAction,
    refetchInterval: 8000,
  });

  const { data: works = [], isLoading: isLoadingWorks } = useQuery({
    queryKey: ["works"],
    queryFn: getWorksAction,
    refetchInterval: 8000,
  });

  const loading = isLoadingClients || isLoadingWorks;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin shadow-sm"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Generating Reports...</p>
        </div>
      </div>
    );
  }

  // --- Core Calculations ---
  const now = new Date();
  const monthLabel = format(now, 'MMMM yyyy');

  // Client name → client object lookup
  const clientMap: Record<string, Client> = {};
  (clients as Client[]).forEach((c: Client) => { clientMap[c.name] = c; });

  const getPricePerTask = (work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  // All-time completed works
  const allCompleted = (works as Work[]).filter((w: Work) => (w.status as string) === 'Completed' || w.status === 'Done');
  const totalDeliveries = allCompleted.length;
  const totalAllTimeRevenue = allCompleted.reduce((s: number, w: Work) => s + getPricePerTask(w), 0);

  // This month completed
  const thisMonthCompleted = allCompleted.filter((w: Work) => {
    const dateStr = w.completedAt || w.updatedAt || w.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthCompleted.reduce((s: number, w: Work) => {
    const c = clientMap[w.client];
    if (!c || c.status === 'Inactive') return s;
    return s + getPricePerTask(w);
  }, 0);
  const thisMonthDeliveries = thisMonthCompleted.length;

  // Pending pipeline
  const pendingWorks = (works as Work[]).filter((w: Work) => ['To Do', 'In Progress', 'Review'].includes(w.status));
  const pendingRevenue = pendingWorks.reduce((s: number, w: Work) => {
    const c = clientMap[w.client];
    if (!c || c.status === 'Inactive') return s;
    return s + getPricePerTask(w);
  }, 0);
  const pendingCount = pendingWorks.length;

  // Completion rate
  const completionRate = works.length > 0 ? Math.round((totalDeliveries / works.length) * 100) : 0;

  // Urgent tasks
  const urgentCount = (works as Work[]).filter((w: Work) => w.priority === 'Urgent' && (w.status as string) !== 'Completed' && w.status !== 'Done').length;

  // Active clients (Active, On Hold, or Completed)
  const activeClients = (clients as Client[]).filter((c: Client) => c.status === 'Active' || (c.status as string) === 'On Hold' || (c.status as string) === 'Completed');

  // Per-client stats for the breakdown table (excluding Inactive clients)
  const clientStats = activeClients.map((client: Client) => {
    const cWorks = (works as Work[]).filter((w: Work) => w.client === client.name);
    const quota = client.thumbnails_per_month || 8;
    const rate = client.price_per_thumbnail > 0
      ? client.price_per_thumbnail
      : quota > 0 ? (client.monthly_price || 0) / quota : 0;

    const completedThisMonth = cWorks.filter((w: Work) => {
      if ((w.status as string) !== 'Completed' && w.status !== 'Done') return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const pending = cWorks.filter((w: Work) => ['To Do', 'In Progress', 'Review'].includes(w.status));

    const earnedThisMonth = completedThisMonth.length * rate;
    const monthlyTarget = client.pricing_model === 'monthly' ? (client.monthly_price || 0) : (quota * rate);
    const progress = monthlyTarget > 0 ? Math.min(100, Math.round((earnedThisMonth / monthlyTarget) * 100)) : 0;

    return {
      client,
      rate,
      quota,
      completedThisMonth: completedThisMonth.length,
      pendingCount: pending.length,
      earnedThisMonth,
      monthlyTarget,
      progress,
      totalAllTime: cWorks.filter((w: Work) => (w.status as string) === 'Completed' || w.status === 'Done').length,
    };
  }).sort((a, b) => b.earnedThisMonth - a.earnedThisMonth);

  // Work status distribution
  const statusCounts = {
    'To Do': (works as Work[]).filter((w: Work) => w.status === 'To Do').length,
    'In Progress': (works as Work[]).filter((w: Work) => w.status === 'In Progress').length,
    'Review': (works as Work[]).filter((w: Work) => w.status === 'Review').length,
    'Completed': (works as Work[]).filter((w: Work) => (w.status as string) === 'Completed' || w.status === 'Done').length,
  };
  const statusMax = Math.max(...Object.values(statusCounts), 1);

  const handleExportCSV = () => {
    const rows = clientStats.map((s) => ({
      Client: s.client.name,
      Niche: s.client.niche || '',
      [`Monthly Target (${symbol})`]: s.monthlyTarget,
      [`Earned This Month (${symbol})`]: s.earnedThisMonth,
      'Completed This Month': s.completedThisMonth,
      'Pending Tasks': s.pendingCount,
      'Monthly Quota': s.quota,
      [`Rate per Delivery (${symbol})`]: s.rate,
      'Total All-Time Deliveries': s.totalAllTime,
      'Progress %': s.progress,
    }));
    downloadCSV(rows, `Reports_${format(now, 'yyyy-MM-dd')}.csv`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 print:bg-white">
      <PageHeader
        title="Reports & Analytics"
        description={`Real-time performance overview · ${monthLabel} · Updates every 8s`}
        action={
          <div className="flex gap-3 print-hide">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Download className="h-4 w-4" />
              PDF Report
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">

          {/* ── Top KPI Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: 'This Month Revenue',
                value: formatCurrency(thisMonthRevenue),
                sub: `${thisMonthDeliveries} deliveries completed`,
                icon: DollarSign,
                color: 'indigo',
                bg: 'bg-indigo-50',
                text: 'text-indigo-600',
              },
              {
                label: 'Pipeline Value',
                value: formatCurrency(pendingRevenue),
                sub: `${pendingCount} tasks in progress`,
                icon: Clock,
                color: 'amber',
                bg: 'bg-amber-50',
                text: 'text-amber-600',
              },
              {
                label: 'All-Time Revenue',
                value: formatCurrency(totalAllTimeRevenue),
                sub: `${totalDeliveries} total deliveries`,
                icon: TrendingUp,
                color: 'emerald',
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
              },
              {
                label: 'Completion Rate',
                value: `${completionRate}%`,
                sub: urgentCount > 0 ? `${urgentCount} urgent tasks` : 'No urgent tasks',
                icon: urgentCount > 0 ? AlertCircle : CheckCircle2,
                color: urgentCount > 0 ? 'red' : 'emerald',
                bg: urgentCount > 0 ? 'bg-red-50' : 'bg-emerald-50',
                text: urgentCount > 0 ? 'text-red-600' : 'text-emerald-600',
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              const isCurrencyIcon = Icon === DollarSign;
              return (
                <div key={kpi.label} className="bg-white rounded-[2rem] p-7 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${kpi.text} select-none`}>
                    {isCurrencyIcon ? (
                      <span className="text-8xl font-black tracking-tighter block leading-none mr-2 mt-2">{symbol}</span>
                    ) : (
                      <Icon className="w-28 h-28" />
                    )}
                  </div>
                  <div className={`p-2.5 ${kpi.bg} rounded-xl ${kpi.text} w-fit mb-4 flex items-center justify-center font-bold text-lg select-none`}>
                    {isCurrencyIcon ? (
                      <span className="w-5 h-5 flex items-center justify-center text-sm leading-none font-black">{symbol}</span>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
                  <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {/* ── Middle: Status Bar Chart + Completion Ring ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Status distribution bar chart */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Task Status Distribution</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Live breakdown of all {works.length} tasks</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <BarChart2 className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'To Do', count: statusCounts['To Do'], color: 'bg-slate-300' },
                  { label: 'In Progress', count: statusCounts['In Progress'], color: 'bg-indigo-500' },
                  { label: 'Review', count: statusCounts['Review'], color: 'bg-amber-500' },
                  { label: 'Completed', count: statusCounts['Completed'], color: 'bg-emerald-500' },
                ].map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-slate-600">
                      <span>{s.label}</span>
                      <span>{s.count} tasks</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.round((s.count / statusMax) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {works.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-100 rounded-2xl mt-6">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No tasks yet — create tasks in the Work board</p>
                </div>
              )}
            </div>

            {/* Completion ring */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-6 left-6 p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Zap className="h-4 w-4" />
              </div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">System Efficiency</h2>

              <div className="relative h-44 w-44 mb-6">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
                  <circle
                    className="text-indigo-600 stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50" cy="50" r="42"
                    fill="transparent"
                    strokeDasharray="263.8"
                    strokeDashoffset={263.8 - (263.8 * completionRate / 100)}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{completionRate}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-3 bg-slate-50 rounded-2xl text-center">
                  <p className="text-lg font-black text-slate-900">{totalDeliveries}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-center">
                  <p className="text-lg font-black text-slate-900">{pendingCount}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Client Performance Table ── */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Client Performance</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {monthLabel} · {activeClients.length} active clients
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {clientStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-slate-200" />
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No active clients yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Orders</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate / Delivery</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">This Month</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                      <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientStats.map((s) => (
                      <tr key={s.client.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Client */}
                        <td className="px-4 sm:px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                              <span className="text-sm font-black text-indigo-600 group-hover:text-white transition-colors">
                                {s.client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-slate-900">{s.client.name}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border select-none ${
                                  s.client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                                  (s.client.status as string) === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                                  s.client.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200/60' :
                                  (s.client.status as string) === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                                  'bg-slate-50 text-slate-700 border-slate-200/60'
                                }`}>
                                  <span className={`h-1 w-1 rounded-full ${
                                    s.client.status === 'Active' ? 'bg-emerald-500' :
                                    (s.client.status as string) === 'On Hold' ? 'bg-amber-500' :
                                    s.client.status === 'Inactive' ? 'bg-red-500' :
                                    (s.client.status as string) === 'Completed' ? 'bg-indigo-500' :
                                    'bg-slate-400'
                                  }`} />
                                  {s.client.status || 'Active'}
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.client.niche || 'General'}</p>
                            </div>
                          </div>
                        </td>
                        {/* Completed / Quota */}
                        <td className="px-6 py-5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-slate-900">{s.completedThisMonth}</span>
                            <span className="text-[10px] font-bold text-slate-400">/ {s.quota}</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Delivered / Quota</p>
                        </td>
                        {/* Rate */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-700">{formatCurrency(s.rate)}</span>
                        </td>
                        {/* Earned this month */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-emerald-600">{formatCurrency(s.earnedThisMonth)}</span>
                        </td>
                        {/* Monthly target */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-500">{formatCurrency(s.monthlyTarget)}</span>
                        </td>
                        {/* Progress bar */}
                        <td className="px-6 py-5 min-w-[120px]">
                          <div className="space-y-1">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${s.progress}%` }}
                              />
                            </div>
                            <p className="text-[9px] font-black text-slate-400">{s.progress}%</p>
                          </div>
                        </td>
                        {/* Pending tasks */}
                        <td className="px-6 py-5">
                          {s.pendingCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                              <Clock className="h-3 w-3" />
                              {s.pendingCount} tasks
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" />
                              Clear
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
