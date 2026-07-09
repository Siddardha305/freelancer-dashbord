'use client'

import React, { useEffect, useState } from 'react';
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { getWorksAction } from '@/dashboard/work/actions/work-actions';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';
import { getTeamMembersAction } from '@/dashboard/settings/actions/team-actions';
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from '@/types/client';
import { Work } from '@/types/work';
import { useRouter } from 'next/navigation';
import { TimeCard } from '@/dashboard/work/components/TimeCard';
import { getTimeLogsAction, getAllTimeLogsAction, clockInAction, clockOutAction } from '@/dashboard/team/actions/time-actions';
import { getLeaveRequestsAction } from '@/dashboard/team/actions/leave-actions';
import { Clock, Calendar, CheckCircle2, AlertCircle, BarChart3, Coffee, Users, Briefcase, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Modular Sub-Components
import { DashboardHeader } from "@/dashboard/overview/components/DashboardHeader";
import { MetricsGrid } from "@/dashboard/overview/components/MetricsGrid";
import { RevenuePerformanceChart } from "@/dashboard/overview/components/RevenuePerformanceChart";
import { SystemEfficiencyCircle } from "@/dashboard/overview/components/SystemEfficiencyCircle";
import { RecentActivityTable } from "@/dashboard/overview/components/RecentActivityTable";

export default function Home() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningTimeStr, setRunningTimeStr] = useState("00 : 00 : 00");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getCurrentUserAction();
        setCurrentUser(userData);
        
        if (!userData) {
          setLoading(false);
          return;
        }

        // Redirect only if they are an editor in a freelance workspace
        if (userData?.teamRole === 'editor' && userData?.workspaceType !== 'corporate') {
          router.replace('/dashboard/work');
          return;
        }

        const [clientsData, worksData] = await Promise.all([
          getClientsAction(),
          getWorksAction()
        ]);
        setClients(clientsData || []);
        setWorks(worksData || []);

        if (userData.workspaceType === 'corporate') {
          const isManager = userData.teamRole === 'owner' || userData.teamRole === 'admin' || !userData.teamRole;
          const logsRes = isManager ? await getAllTimeLogsAction() : await getTimeLogsAction();
          if (logsRes.success) {
            setTimeLogs(logsRes.logs || []);
          }
          const leavesRes = await getLeaveRequestsAction();
          if (leavesRes.success) {
            setLeaveRequests(leavesRes.leaves || []);
          }
          try {
            const teamRes = await getTeamMembersAction();
            setMembers(teamRes || []);
          } catch (e) {
            console.error("Failed to load team members in overview", e);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [router]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c: Client) => c.status === "Active").length;

  // Build a lookup: client name → client object
  const clientMap: Record<string, Client> = {};
  clients.forEach((c: Client) => { clientMap[c.name] = c; });

  // Helper: get effective price per thumbnail for a task's client
  const getPricePerTask = (work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.status === "Inactive") return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  // TOTAL REVENUE: completed/done tasks this calendar month × their rate
  const now = new Date();
  const completedThisMonth = works.filter((w: Work) => {
    if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
    const dateStr = w.completedAt || w.updatedAt || w.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = completedThisMonth.reduce(
    (acc: number, w: Work) => acc + getPricePerTask(w), 0
  );


  // PENDING: tasks still To Do / In Progress / Review
  const pendingWorks = works.filter((w: Work) =>
    ["To Do", "In Progress", "Review"].includes(w.status)
  );
  const pendingPayments = pendingWorks.reduce(
    (acc: number, w: Work) => acc + getPricePerTask(w), 0
  );

  // DELIVERED: all-time completed or done tasks
  const completedWorks = works.filter((w: Work) =>
    (w.status as string) === "Completed" || w.status === "Done"
  ).length;

  const completionRate = works.length > 0
    ? Math.round((completedWorks / works.length) * 100)
    : 0;

  const isCorporate = currentUser?.workspaceType === 'corporate';
  const isManager = currentUser?.teamRole === 'owner' || currentUser?.teamRole === 'admin' || !currentUser?.teamRole;
  const isViewer = currentUser?.teamRole === 'viewer';

  // Corporate stats
  const activeLogs = timeLogs.filter((log: any) => log.status === 'active');
  const activeUserIds = new Set(activeLogs.map((log: any) => log.userId));
  const activeSessionsCount = activeUserIds.size;

  const totalMinutes = timeLogs.reduce((acc: number, log: any) => acc + (log.durationMinutes || 0), 0);
  const totalOfficeHours = (totalMinutes / 60).toFixed(1);

  // Employee-specific stats
  const myAssigned = works.filter((w: Work) => w.assignedTo === currentUser?.id);
  const myCompleted = myAssigned.filter((w: Work) => (w.status as string) === 'Completed' || w.status === 'Done').length;
  const myPending = myAssigned.filter((w: Work) => ['To Do', 'In Progress', 'Review'].includes(w.status)).length;
  
  const myLogs = timeLogs.filter((log: any) => log.userId === currentUser?.id || (typeof log.userId === 'object' && log.userId?.id === currentUser?.id));
  const myPresentDates = new Set(myLogs.map((log: any) => new Date(log.clockIn).toDateString()));
  const myPresentDays = myPresentDates.size;
  
  const myApprovedLeaves = leaveRequests.filter((l: any) => {
    const uid = typeof l.userId === 'object' && l.userId ? l.userId.id : l.userId;
    return uid === currentUser?.id && l.status === 'approved';
  }).length;

  // Clock state and methods
  const activeLog = timeLogs.find((log: any) => (log.userId === currentUser?.id || (typeof log.userId === 'object' && log.userId?.id === currentUser?.id)) && log.status === 'active');

  useEffect(() => {
    if (!activeLog) {
      setRunningTimeStr("00 : 00 : 00");
      return;
    }
    const updateClock = () => {
      const start = new Date(activeLog.clockIn).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - start);
      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      
      const pad = (n: number) => String(n).padStart(2, '0');
      setRunningTimeStr(`${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [activeLog]);

  const handleClockIn = async () => {
    setIsPending(true);
    try {
      const res = await clockInAction();
      if (res.success) {
        toast.success(res.message);
        const logsRes = isManager ? await getAllTimeLogsAction() : await getTimeLogsAction();
        if (logsRes.success) {
          setTimeLogs(logsRes.logs || []);
        }
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('An error occurred during clock-in.');
    } finally {
      setIsPending(false);
    }
  };

  const handleClockOut = async () => {
    setIsPending(true);
    try {
      const res = await clockOutAction();
      if (res.success) {
        toast.success(res.message);
        const logsRes = isManager ? await getAllTimeLogsAction() : await getTimeLogsAction();
        if (logsRes.success) {
          setTimeLogs(logsRes.logs || []);
        }
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('An error occurred during clock-out.');
    } finally {
      setIsPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin shadow-sm"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isCorporate) {
    const pseudoId = currentUser?.id ? `EMP-${currentUser.id.slice(-5).toUpperCase()}` : 'EMP-001';

    // Find Reporting Manager & Department Members
    const reportingManager = members.find((m: any) => m.teamRole === 'owner' || m.teamRole === 'admin') || {
      name: 'Admin Manager',
      email: 'workspace@corporate.com',
      id: 'manager'
    };
    const managerId = reportingManager.id || reportingManager._id || 'manager';
    const managerIsActive = activeUserIds.has(managerId);
    const managerPseudoId = managerId !== 'manager' ? `MGR-${managerId.slice(-5).toUpperCase()}` : 'MGR-001';

    const otherMembers = members.filter((m: any) => {
      const mid = m.id || m._id;
      return mid !== currentUser?.id && m.teamRole !== 'owner' && m.teamRole !== 'admin';
    });

    // Welcome Greetings based on time of day
    const currentHour = new Date().getHours();
    const timeGreeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Calculate Dates for weekly attendance schedule
    const getWeekDays = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - dayOfWeek + i);
        days.push(d);
      }
      return days;
    };
    const weekDays = getWeekDays();

    const getDayStatus = (d: Date) => {
      const dateStr = d.toDateString();
      const isWrkDay = d.getDay() !== 0 && d.getDay() !== 6;
      
      // Check if on leave
      const onLeave = leaveRequests.some((l: any) => {
        const uid = typeof l.userId === 'object' && l.userId ? l.userId.id : l.userId;
        return uid === currentUser?.id && l.status === 'approved' && new Date(l.date).toDateString() === dateStr;
      });
      if (onLeave) {
        return { label: 'Leave', color: 'text-purple-650 font-black' };
      }

      const dayLogs = myLogs.filter((log: any) => new Date(log.clockIn).toDateString() === dateStr);
      if (dayLogs.length > 0) {
        const mins = dayLogs.reduce((sum: number, l: any) => sum + (l.durationMinutes || 0), 0);
        const hrs = (mins / 60).toFixed(1);
        return { label: 'Present', sub: `${hrs}h`, color: 'text-emerald-600 font-black' };
      }

      if (!isWrkDay) {
        return { label: 'Weekend', color: 'text-amber-500 font-bold' };
      }
      
      const todayStr = new Date().toDateString();
      if (d.getTime() > Date.now()) {
        return { label: 'Pending', color: 'text-slate-400 font-bold' };
      } else if (d.toDateString() === todayStr) {
        return { label: 'Pending', color: 'text-slate-400 font-bold' };
      } else {
        return { label: 'Absent', color: 'text-red-500 font-black' };
      }
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-955/10">
        <DashboardHeader userName={currentUser?.name || 'Collaborator'} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* LEFT COLUMN: Profile info cards */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Employee Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center relative pt-12 mt-6">
                  {/* Floating Centered Avatar */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-2xl bg-indigo-650 text-white flex items-center justify-center font-black text-md shadow-lg shadow-indigo-200 dark:shadow-none border-2 border-white dark:border-slate-900 select-none">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <div className="text-center w-full mt-2">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{pseudoId}</p>
                    <h3 className="text-md font-black text-slate-850 dark:text-white tracking-tight mt-0.5">{currentUser?.name}</h3>
                    <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mt-1 bg-slate-50 dark:bg-slate-955/60 py-1 px-3.5 rounded-full border border-slate-100 dark:border-slate-800/60 w-fit mx-auto">
                      {currentUser?.teamRole || 'Employee'}
                    </p>
                  </div>

                  <div className="w-full border-t border-slate-100 dark:border-slate-800/80 my-5" />

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeLog ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeLog ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {activeLog ? 'On-Duty' : 'Off-Duty'}
                    </span>
                  </div>

                  {/* Running Timer */}
                  <div className="flex justify-center gap-2 font-mono font-black text-sm py-2.5 px-4 bg-slate-50 dark:bg-slate-955/50 border border-slate-100 dark:border-slate-800/80 rounded-xl mb-5 w-full select-none">
                    {runningTimeStr.split(' : ').map((part, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-slate-350 dark:text-slate-700">:</span>}
                        <span className="text-slate-800 dark:text-slate-200">{part}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Swipe Actions */}
                  {activeLog ? (
                    <button
                      onClick={handleClockOut}
                      disabled={isPending}
                      className="w-full border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 dark:text-red-450 font-black uppercase text-[9px] tracking-widest py-3 rounded-2xl transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50"
                    >
                      {isPending ? 'Processing...' : 'Check-out'}
                    </button>
                  ) : (
                    <button
                      onClick={handleClockIn}
                      disabled={isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest py-3 rounded-2xl transition-all shadow-md shadow-emerald-100 dark:shadow-none cursor-pointer select-none active:scale-95 disabled:opacity-50"
                    >
                      {isPending ? 'Processing...' : 'Check-in'}
                    </button>
                  )}
                </div>

                {/* Reporting Manager Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Manager</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none">
                      {reportingManager.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{reportingManager.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{managerPseudoId}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                      managerIsActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        : 'bg-slate-50 text-slate-450 border-slate-200/50 dark:border-slate-800'
                    }`}>
                      {managerIsActive ? 'In' : 'Out'}
                    </span>
                  </div>
                </div>

                {/* Department Members */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Members</p>
                  
                  {otherMembers.length === 0 ? (
                    <p className="text-[10px] font-bold text-slate-350 dark:text-slate-600 uppercase tracking-wide py-2 text-center">No other members registered</p>
                  ) : (
                    <div className="space-y-3.5 max-h-56 overflow-y-auto">
                      {otherMembers.map((m: any) => {
                        const mid = m.id || m._id;
                        const mActive = activeUserIds.has(mid);
                        const mPseudoId = `EMP-${mid.slice(-5).toUpperCase()}`;
                        return (
                          <div key={mid} className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-600 dark:text-slate-450 border border-slate-200/40 dark:border-slate-800 flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase">
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{m.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{mPseudoId}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                              mActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                : 'bg-slate-50 text-slate-450 border-slate-200/50 dark:border-slate-800'
                            }`}>
                              {mActive ? 'In' : 'Out'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Welcome banner, Work schedule, and Assigned Tasks */}
              <div className="space-y-8 mt-6 lg:col-span-3">
                
                {/* Welcome Greeting Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm flex items-center justify-between overflow-hidden relative group">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl flex items-center justify-center shrink-0">
                      {currentHour < 18 ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {timeGreeting}, {currentUser?.name || 'Collaborator'}
                      </h2>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider mt-1">Have a productive day!</p>
                    </div>
                  </div>
                </div>

                {/* Work Schedule / Weekly Timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-555">
                        <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-widest">Work Schedule</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          {format(weekDays[0], 'dd-MM-yyyy')} - {format(weekDays[6], 'dd-MM-yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Shift Banner */}
                    <div className="bg-red-50/50 dark:bg-red-955/20 border border-red-100/50 dark:border-red-950/20 p-4 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-black text-red-800 dark:text-red-405 uppercase tracking-wider text-[9px]">General Shift</span>
                      <span className="font-bold text-red-600 dark:text-red-455 font-mono">8:30 AM - 5:30 PM</span>
                    </div>

                    {/* Days timeline grid */}
                    <div className="grid grid-cols-7 gap-3 text-center pt-2">
                      {weekDays.map((d: Date, idx: number) => {
                        const status = getDayStatus(d);
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                          <div key={idx} className="space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{format(d, 'eee')}</p>
                            <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center min-h-[4.5rem] transition-all ${
                              isToday 
                                ? 'bg-indigo-600 border-indigo-650 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                                : 'bg-slate-50 dark:bg-slate-955 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-355'
                            }`}>
                              <span className={`text-md font-black font-mono ${isToday ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                {format(d, 'dd')}
                              </span>
                              <span className={`text-[8px] font-bold uppercase tracking-wider mt-1.5 ${isToday ? 'text-indigo-100' : status.color}`}>
                                {status.label}
                              </span>
                              {status.sub && (
                                <span className={`text-[8px] font-bold mt-0.5 ${isToday ? 'text-indigo-150' : 'text-slate-450 dark:text-slate-400'}`}>
                                  {status.sub}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                {/* Assigned Deliverables List */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest ml-1">
                    {isManager ? "Active Workspace Tasks" : "My Assigned Tasks"}
                  </h3>
                  
                  {(isManager ? works : myAssigned).length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm">
                      <Briefcase className="h-10 w-10 text-slate-300 mb-4" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">No tasks configured</h4>
                      <p className="text-[10px] text-slate-455 dark:text-slate-550 font-bold uppercase tracking-widest max-w-xs mx-auto">Tasks will show up here once created by the manager.</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-955/20">
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task / Deliverable</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(isManager ? works : myAssigned).slice(0, 5).map((w: any) => (
                              <tr key={w.id || w._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-955/20 transition-colors">
                                <td className="px-6 py-5">
                                  <span className="text-sm font-black text-slate-900 dark:text-white">{w.title}</span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {w.client}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-355">
                                    {w.deadline ? format(new Date(w.deadline), 'MMM dd, yyyy') : '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                                    w.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200/50' :
                                    w.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200/50' :
                                    'bg-slate-50 text-slate-600 border-slate-200/50'
                                  }`}>
                                    {w.priority}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                                    w.status === 'Completed' || w.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                                    w.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-250 animate-pulse' :
                                    w.status === 'Review' ? 'bg-purple-50 text-purple-700 border-purple-250' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                  }`}>
                                    {w.status}
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

            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <DashboardHeader userName={currentUser?.name || 'Admin Manager'} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* Main Highlights */}
          <MetricsGrid 
            totalClients={totalClients}
            activeClients={activeClients}
            thisMonthRevenue={formatCurrency(thisMonthRevenue)}
            pendingPayments={formatCurrency(pendingPayments)}
            pendingPaymentsAmount={pendingPayments}
            completedWorks={completedWorks}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Revenue Analytics */}
            <RevenuePerformanceChart 
              works={works}
              clients={clients}
              formatCurrency={formatCurrency}
            />

            {/* Performance Stats */}
            <SystemEfficiencyCircle completionRate={completionRate} />
          </div>

          {/* Detailed Network Table */}
          <RecentActivityTable clients={clients} formatCurrency={formatCurrency} />
        </div>
      </main>
    </div>
  );
}
