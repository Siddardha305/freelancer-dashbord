'use client'

import React from 'react';
import { Calendar, CheckCircle2, User, Award, Inbox, Clock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { Work } from "@/types/work";
import { Client } from "@/types/client";

interface WorkHistoryViewProps {
  tasks: Work[];
  clients: Client[];
  formatCurrency: (value: number | string) => string;
  isEditor?: boolean;
}

export function WorkHistoryView({ tasks, clients, formatCurrency, isEditor = false }: WorkHistoryViewProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter tasks completed in the current month
  const completedThisMonth = tasks.filter((t) => {
    if ((t.status as string) !== "Completed" && t.status !== "Done") return false;
    const dateStr = t.completedAt || t.updatedAt || t.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Group tasks by day (latest first) and calculate total daily earnings
  const clientMap: Record<string, Client> = {};
  clients.forEach((c) => {
    clientMap[c.name] = c;
  });

  const getPricePerTask = (work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.status === "Inactive") return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  const groups: Record<string, { date: Date; tasks: Work[]; totalEarnings: number }> = {};

  completedThisMonth.forEach((task) => {
    const dateStr = task.completedAt || task.updatedAt || task.createdAt;
    if (!dateStr) return;
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    if (!groups[key]) {
      groups[key] = {
        date: d,
        tasks: [],
        totalEarnings: 0
      };
    }

    groups[key].tasks.push(task);
    groups[key].totalEarnings += getPricePerTask(task);
  });

  const dailyHistory = Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, value]) => ({
      key,
      ...value
    }));

  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Compute total monthly earnings from completed tasks
  const totalMonthlyEarnings = dailyHistory.reduce((sum, day) => sum + day.totalEarnings, 0);

  const getPricePerTaskDirect = (task: Work): number => {
    const clientMap: Record<string, Client> = {};
    clients.forEach((c) => {
      clientMap[c.name] = c;
    });
    const c = clientMap[task.client];
    if (!c) return 0;
    if (c.status === "Inactive") return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Monthly Summary Banner Card */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Worked This Month</span>
            <h2 className="text-3xl font-extrabold tracking-tight">{monthLabel}</h2>
            <p className="text-xs text-indigo-100 font-medium">Daily archive of your completed jobs and milestones</p>
          </div>
          <div className="flex gap-4 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:px-6 border border-white/10 flex flex-col justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Tasks Completed</span>
              <span className="text-2xl font-black mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {completedThisMonth.length}
              </span>
            </div>
            {!isEditor ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:px-6 border border-white/10 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Month Earnings</span>
                <span className="text-2xl font-black mt-1 text-emerald-300">
                  {formatCurrency(totalMonthlyEarnings)}
                </span>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:px-6 border border-white/10 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Incomplete Tasks</span>
                <span className="text-2xl font-black mt-1 flex items-center gap-2 text-rose-300">
                  <Clock className="h-5 w-5 text-rose-450" />
                  {tasks.filter((t) => (t.status as string) !== "Completed" && t.status !== "Done").length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="space-y-6 relative pl-4 sm:pl-8 before:absolute before:left-[19px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
        {dailyHistory.map((dayGroup) => {
          const formattedDate = isToday(dayGroup.date) 
            ? 'Today' 
            : isYesterday(dayGroup.date) 
              ? 'Yesterday' 
              : format(dayGroup.date, 'EEEE, MMM dd, yyyy');

          return (
            <div key={dayGroup.key} className="space-y-4 relative group/day">
              {/* Daily Header Marker */}
              <div className="flex items-center gap-4 -ml-4 sm:-ml-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none group-hover/day:scale-110 transition-transform">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{formattedDate}</h3>
                  {!isEditor ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-extrabold uppercase tracking-wide">
                      + {formatCurrency(dayGroup.totalEarnings)}
                    </div>
                  ) : (
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-extrabold uppercase tracking-wide">
                      {dayGroup.tasks.length} {dayGroup.tasks.length === 1 ? 'Task' : 'Tasks'}
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks of the Day */}
              <div className="space-y-3 pl-4 sm:pl-8">
                {dayGroup.tasks.map((task) => {
                  const taskPrice = getPricePerTaskDirect(task);
                  return (
                    <div 
                      key={task.id} 
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md dark:hover:shadow-slate-955 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group/task"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {(() => {
                            const clientObj = clients.find(c => c.name.toLowerCase() === task.client.toLowerCase());
                            const channelLink = clientObj?.channel_link;
                            const cleanUrl = channelLink ? (channelLink.startsWith('http') ? channelLink : `https://${channelLink}`) : '';
                            return channelLink ? (
                              <a 
                                href={cleanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <User className="h-3 w-3 text-indigo-500" />
                                {task.client}
                              </a>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md flex items-center gap-1">
                                <User className="h-3 w-3 text-indigo-500" />
                                {task.client}
                              </span>
                            );
                          })()}
                          <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100/30 dark:border-indigo-900/20">
                            {task.priority} Priority
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/task:text-indigo-600 dark:group-hover/task:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                        {!isEditor && (
                          <div className="flex flex-col sm:items-end">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Priced Rate</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatCurrency(taskPrice)}
                            </span>
                          </div>
                        )}
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
                          <Award className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {dailyHistory.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-16 text-center shadow-xs flex flex-col items-center justify-center gap-5 -ml-4 sm:-ml-8 relative z-10">
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-700 border border-slate-100 dark:border-slate-800/80 shadow-inner">
              <Inbox className="h-10 w-10 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm uppercase tracking-wider">No completed tasks this month</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                You haven&apos;t completed any tasks in the current calendar month yet. Finish tasks in your board or list to populate your work history!
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
