'use client'

import React from 'react';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  BarChart2,
  Zap,
} from "lucide-react";
import { format } from 'date-fns';
import { Work } from '@/types/work';
import { cn } from '@/lib/utils';

interface EditorReportsViewProps {
  currentUser: any;
  activeWorks: Work[];
  completionRate: number;
  totalDeliveries: number;
  pendingCount: number;
  urgentCount: number;
  statusCounts: {
    'To Do': number;
    'In Progress': number;
    'Review': number;
    'Completed': number;
  };
  statusMax: number;
}

export function EditorReportsView({
  currentUser,
  activeWorks,
  completionRate,
  totalDeliveries,
  pendingCount,
  urgentCount,
  statusCounts,
  statusMax,
}: EditorReportsViewProps) {
  return (
    <div className="space-y-10">
      {/* ── Top KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Month Deliveries',
            value: String(activeWorks.filter((w) => {
              const dateStr = w.completedAt || w.updatedAt || w.createdAt;
              if (!dateStr) return false;
              const d = new Date(dateStr);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && ((w.status as string) === 'Completed' || w.status === 'Done');
            }).length),
            sub: 'Deliveries completed this month',
            icon: CheckCircle2,
            bg: 'bg-indigo-50 dark:bg-indigo-950/30',
            text: 'text-indigo-650 dark:text-indigo-400',
          },
          {
            label: 'Pending Tasks',
            value: String(pendingCount),
            sub: 'Tasks currently in progress',
            icon: Clock,
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            text: 'text-amber-650 dark:text-amber-400',
          },
          {
            label: 'Total Deliveries',
            value: String(totalDeliveries),
            sub: 'All-time completed deliveries',
            icon: TrendingUp,
            bg: 'bg-emerald-50 dark:bg-emerald-955/30',
            text: 'text-emerald-650 dark:text-emerald-400',
          },
          {
            label: 'Completion Rate',
            value: `${completionRate}%`,
            sub: urgentCount > 0 ? `${urgentCount} urgent tasks` : 'No urgent tasks',
            icon: urgentCount > 0 ? AlertCircle : CheckCircle2,
            bg: urgentCount > 0 ? 'bg-red-50 dark:bg-red-955/30' : 'bg-emerald-50 dark:bg-emerald-955/30',
            text: urgentCount > 0 ? 'text-red-650 dark:text-red-400' : 'text-emerald-650 dark:text-emerald-400',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-[2rem] p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 select-none", kpi.text)}>
                <Icon className="w-28 h-28" />
              </div>
              <div className={cn("p-2.5 rounded-xl w-fit mb-4 flex items-center justify-center font-bold text-lg select-none", kpi.bg, kpi.text)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">{kpi.value}</p>
              <p className="mt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Middle: Status Bar Chart + Completion Ring ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status distribution bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-widest">Task Status Distribution</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Live breakdown of all {activeWorks.length} tasks</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-5">
            {[
              { label: 'To Do', count: statusCounts['To Do'], color: 'bg-slate-300 dark:bg-slate-700' },
              { label: 'In Progress', count: statusCounts['In Progress'], color: 'bg-indigo-500' },
              { label: 'Review', count: statusCounts['Review'], color: 'bg-amber-500' },
              { label: 'Completed', count: statusCounts['Completed'], color: 'bg-emerald-500' },
            ].map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex justify-between text-xs font-black text-slate-650 dark:text-slate-400">
                  <span>{s.label}</span>
                  <span>{s.count} tasks</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", s.color)}
                    style={{ width: `${Math.round((s.count / statusMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {activeWorks.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mt-6">
              <p className="text-[10px] font-bold text-slate-350 dark:text-slate-600 uppercase tracking-widest">No tasks assigned yet</p>
            </div>
          )}
        </div>

        {/* Completion ring */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-6 left-6 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
            <Zap className="h-4 w-4" />
          </div>
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">System Efficiency</h2>

          <div className="relative h-44 w-44 mb-6">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
              <circle
                className="text-indigo-600 dark:text-indigo-500 stroke-current"
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
              <span className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">{completionRate}%</span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Done</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center">
              <p className="text-lg font-black text-slate-900 dark:text-slate-50">{totalDeliveries}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Delivered</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-955 rounded-2xl text-center">
              <p className="text-lg font-black text-slate-900 dark:text-slate-50">{pendingCount}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Client / Editor Performance Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-105 dark:border-slate-805 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-widest">My Deliverables Log</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Showing your assigned work nodes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Live Sync</span>
          </div>
        </div>

        {activeWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-3xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-slate-200 dark:text-slate-800" />
            </div>
            <p className="text-[10px] font-bold text-slate-350 dark:text-slate-650 uppercase tracking-widest">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-955/30">
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deliverable Name</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Priority</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Revisions</th>
                  <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeWorks.map((w: Work) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/20 transition-colors group">
                    <td className="px-4 sm:px-6 py-5 text-sm font-black text-slate-900 dark:text-slate-50">
                      {w.title}
                    </td>
                    <td className="px-4 sm:px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {w.client}
                    </td>
                    <td className="px-4 sm:px-6 py-5 text-xs font-bold text-slate-600 dark:text-slate-450">
                      {(() => {
                        const d = new Date(w.deadline);
                        return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : w.deadline;
                      })()}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        w.priority === 'Urgent' ? 'bg-red-600 text-white border-red-600' :
                        w.priority === 'High' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30' : 
                        w.priority === 'Normal' ? 'bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 
                        'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                      )}>
                        {w.priority}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-5 text-xs font-bold text-slate-600 dark:text-slate-450">
                      {w.revisions || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        w.status === 'Completed' || w.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        w.status === 'Review' ? 'bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                        w.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-750 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' :
                        'bg-slate-50 dark:bg-slate-955/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      )}>
                        {w.status === 'Completed' ? 'Done' : w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
