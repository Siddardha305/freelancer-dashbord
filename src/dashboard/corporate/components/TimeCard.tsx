'use client'

import React, { useState, useEffect, startTransition } from 'react';
import { Play, Square, Clock, Calendar, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { clockInAction, clockOutAction, getActiveTimeLogAction, getTimeLogsAction } from '@/dashboard/team/actions/time-actions';
import { applyLeaveAction, getLeaveRequestsAction } from '@/dashboard/corporate/actions/leave-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TimeCard() {
  const [activeLog, setActiveLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isPending, setIsPending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Leave states
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveDate, setLeaveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveReason, setLeaveReason] = useState('');
  const [isLeavePending, setIsLeavePending] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  // Sync state on load
  const syncTimeLog = async () => {
    try {
      const activeRes = await getActiveTimeLogAction();
      if (activeRes.success) {
        setActiveLog(activeRes.log);
      }
      const logsRes = await getTimeLogsAction();
      if (logsRes.success) {
        setLogs(logsRes.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncLeaveRequests = async () => {
    try {
      const leavesRes = await getLeaveRequestsAction();
      if (leavesRes.success) {
        setLeaveRequests(leavesRes.leaves || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    syncTimeLog();
    syncLeaveRequests();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeLog && activeLog.clockIn) {
      const updateTimer = () => {
        const start = new Date(activeLog.clockIn).getTime();
        const now = new Date().getTime();
        const diffMs = now - start;
        
        const hrs = Math.floor(diffMs / (3600 * 1000));
        const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        const secs = Math.floor((diffMs % (60 * 1000)) / 1000);

        const pad = (num: number) => String(num).padStart(2, '0');
        setElapsedTime(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      };

      updateTimer(); // run once immediately
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => clearInterval(interval);
  }, [activeLog]);

  const handleClockIn = () => {
    setIsPending(true);
    startTransition(async () => {
      try {
        const res = await clockInAction();
        if (res.success) {
          toast.success(res.message);
          await syncTimeLog();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error('An error occurred during clock-in.');
      } finally {
        setIsPending(false);
      }
    });
  };

  const handleClockOut = () => {
    setIsPending(true);
    startTransition(async () => {
      try {
        const res = await clockOutAction();
        if (res.success) {
          toast.success(res.message);
          await syncTimeLog();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error('An error occurred during clock-out.');
      } finally {
        setIsPending(false);
      }
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate) {
      toast.error('Please select a date.');
      return;
    }
    setIsLeavePending(true);
    startTransition(async () => {
      try {
        const res = await applyLeaveAction(leaveDate, leaveReason);
        if (res.success) {
          toast.success(res.message);
          setLeaveReason('');
          await syncLeaveRequests();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error('An error occurred while requesting leave.');
      } finally {
        setIsLeavePending(false);
      }
    });
  };

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
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-bg rounded-[2rem] border border-card-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 border ${
            activeLog 
              ? 'bg-emerald-50 dark:bg-emerald-955 text-emerald-600 border-emerald-100/50' 
              : 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 border-slate-100 dark:border-slate-800'
          }`}>
            <Clock className={`h-6 w-6 ${activeLog ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance clock</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide border ${
                activeLog 
                  ? 'bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-455 border-emerald-100/50' 
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200/50 dark:border-slate-800'
              }`}>
                {activeLog ? 'On-Duty' : 'Off-Duty'}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-955 dark:text-white mt-1 tracking-tight">
              {activeLog ? `Checked in at ${formatLogTime(activeLog.clockIn)}` : 'Ready to Swipe In'}
            </h3>
            {activeLog && (
              <p className="text-xs font-mono font-black text-indigo-650 dark:text-indigo-400 mt-0.5 tracking-wider">
                Elapsed session time: <span className="underline">{elapsedTime}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setShowLeaveForm(prev => !prev);
              setShowHistory(false); // Close history
            }}
            className={`flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-4.5 rounded-2xl transition-all border cursor-pointer active:scale-95 ${
              showLeaveForm
                ? 'bg-indigo-50 border-indigo-200 text-indigo-650 dark:bg-indigo-950/20 dark:border-indigo-900/30'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-655 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-355'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Request Leave
          </button>

          {!activeLog ? (
            <button
              onClick={handleClockIn}
              disabled={isPending}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4.5 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              Swipe In / Clock In
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={isPending}
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4.5 rounded-2xl transition-all shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Square className="h-4 w-4 fill-white" />
              Swipe Out / Clock Out
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
              title="Toggle logs history"
            >
              {showHistory ? <ChevronUp className="h-4.5 w-4.5 text-slate-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-500" />}
            </button>
          )}
        </div>
      </div>

      {/* History Collapsible Panel */}
      {showHistory && logs.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-955/20 px-8 py-6 space-y-4 max-h-60 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
            <span>Recent Session Check-ins</span>
            <span>Duration Log</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div 
                key={log._id || log.id}
                className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4 text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div className="space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-250 font-bold">{formatLogDate(log.clockIn)}</p>
                    <p className="text-[10px] text-slate-400">
                      {formatLogTime(log.clockIn)} - {log.clockOut ? formatLogTime(log.clockOut) : 'Active'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-355">
                    {log.status === 'active' ? 'Active session' : formatLogDuration(log.durationMinutes)}
                  </span>
                  {log.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Request Collapsible Panel */}
      {showLeaveForm && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-955/20 px-8 py-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leave Application Form */}
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">Apply for Leave</h4>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Leave Date</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Reason (Optional)</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter details..."
                    rows={2}
                    className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLeavePending}
                  className="w-full bg-indigo-650 hover:bg-indigo-755 text-white font-black uppercase text-[10px] tracking-widest py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLeavePending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

            {/* Leave History List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-2">Leave History & Status</h4>
              
              {leaveRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">No leave requests found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {leaveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4 text-xs font-semibold"
                    >
                      <div className="space-y-1">
                        <p className="text-slate-800 dark:text-slate-250 font-bold">
                          {formatLogDate(req.date)}
                        </p>
                        {req.reason && (
                          <p className="text-[10px] text-slate-455 dark:text-slate-400 font-medium italic truncate max-w-[180px]">
                            "{req.reason}"
                          </p>
                        )}
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-250'
                          : 'bg-amber-50 text-amber-700 border-amber-250'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
