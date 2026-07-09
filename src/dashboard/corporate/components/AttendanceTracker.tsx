'use client'

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { TimeCard } from '@/dashboard/work/components/TimeCard';
import { getTimeLogsAction, getAllTimeLogsAction } from '@/dashboard/team/actions/time-actions';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';
import { format } from 'date-fns';

export function AttendanceTracker() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await getCurrentUserAction();
        setCurrentUser(u);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const isManager = currentUser?.teamRole === 'owner' || currentUser?.teamRole === 'admin' || !currentUser?.teamRole;

  const { data: logsRes, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["timeLogs", isManager],
    queryFn: () => isManager ? getAllTimeLogsAction() : getTimeLogsAction(),
    enabled: !!currentUser,
    refetchInterval: 8000,
  });

  const logs = logsRes?.logs || [];
  const isLoading = loadingUser || isLoadingLogs;

  const formatLogDuration = (mins: number) => {
    if (!mins) return '0m';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  const formatLogTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'hh:mm a');
    } catch {
      return '';
    }
  };

  const formatLogDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM dd, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-955/10">
      <PageHeader 
        title="Attendance Tracker" 
        description={isManager ? "Monitor and manage employee check-ins and session registries workspace-wide." : "Clock in and out, track session timings, and view active logs."}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* Main check-in card */}
          <TimeCard />

          {/* Complete Attendance History List */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest ml-1">
              {isManager ? "Workspace Employee Attendance Registry" : "Session Logs Registry"}
            </h3>

            {isLoading ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading Attendance Logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm">
                <Clock className="h-10 w-10 text-slate-300 mb-4" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  {isManager ? "No employee attendance logs logged yet" : "No attendance logs logged yet"}
                </h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-550 font-bold uppercase tracking-widest max-w-xs mx-auto">
                  {isManager ? "Employee check-in sessions will show up here automatically." : "Use the Clock In button above to log your first work session."}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-955/20">
                        {isManager && (
                          <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                        )}
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                        <th className="px-4 sm:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {logs.map((log: any) => (
                        <tr key={log.id || log._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-955/20 transition-colors">
                          {isManager && (
                            <td className="px-4 sm:px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    {log.userId?.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{log.userId?.name || 'Unknown User'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.userId?.email || ''}</p>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-4 sm:px-8 py-5">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4.5 w-4.5 text-slate-400" />
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {formatLogDate(log.clockIn)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-5">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-355 font-mono">
                              {formatLogTime(log.clockIn)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-8 py-5">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-355 font-mono">
                              {log.clockOut ? formatLogTime(log.clockOut) : '—'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-8 py-5">
                            <span className="text-sm font-black text-indigo-650 dark:text-indigo-400 font-mono">
                              {log.status === 'active' ? 'Running session' : formatLogDuration(log.durationMinutes)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              log.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250 animate-pulse' 
                                : 'bg-slate-50 text-slate-450 border-slate-200/50 dark:border-slate-800'
                            }`}>
                              {log.status === 'active' ? 'On-Duty' : 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
