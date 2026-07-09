'use client'

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { applyLeaveAction, getLeaveRequestsAction } from '@/dashboard/corporate/actions/leave-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function LeaveTracker() {
  const queryClient = useQueryClient();
  const [leaveDate, setLeaveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [leaveReason, setLeaveReason] = useState('');

  const { data: leavesRes, isLoading } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: getLeaveRequestsAction,
    refetchInterval: 8000,
  });

  const applyLeaveMutation = useMutation({
    mutationFn: ({ date, reason }: { date: string; reason: string }) => applyLeaveAction(date, reason),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        setLeaveReason('');
        queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      toast.error('An error occurred. Please try again.');
      console.error(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate) {
      toast.error('Please select a date.');
      return;
    }
    applyLeaveMutation.mutate({ date: leaveDate, reason: leaveReason });
  };

  const leaveRequests = leavesRes?.leaves || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/10">
      <PageHeader 
        title="Leave Tracker" 
        description="Request absence and track approved leave days."
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Form Card */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6">Apply for Leave</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Date</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    required
                    className="w-full px-5 py-4 text-xs bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Explanation</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter details..."
                    rows={4}
                    className="w-full px-5 py-4 text-xs bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applyLeaveMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest py-4.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {applyLeaveMutation.isPending ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>

            {/* List Card */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest ml-1">Leave History & Status</h3>
              
              {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syncing Registry...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm">
                  <Calendar className="h-10 w-10 text-slate-300 mb-4" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">No leave requests requested</h4>
                  <p className="text-[10px] text-slate-455 dark:text-slate-550 font-bold uppercase tracking-widest max-w-xs mx-auto">Fill in the leave request form to request time off.</p>
                </div>
              ) : (
                <div className="glass-bg rounded-[2.5rem] border border-card-border overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {leaveRequests.map((req: any) => (
                      <div 
                        key={req.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-8 gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-955 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center font-bold text-md uppercase shrink-0">
                            <Calendar className="h-5 w-5" />
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {format(new Date(req.date), 'MMMM dd, yyyy')}
                              </h4>
                              {req.userId?.name && (
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30 rounded text-[9px] font-black uppercase tracking-wider select-none">
                                  {req.userId.name}
                                </span>
                              )}
                            </div>
                            {req.reason && (
                              <p className="text-[10px] text-slate-455 dark:text-slate-500 font-medium italic mt-0.5 max-w-md truncate">
                                "{req.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-end">
                          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                              : req.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-250'
                              : 'bg-amber-50 text-amber-700 border-amber-250'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
