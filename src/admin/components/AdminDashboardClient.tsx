'use client'

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  IndianRupee, 
  Mail, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Clock, 
  Loader2, 
  ShieldAlert, 
  ExternalLink,
  UserCheck,
  ChevronDown,
  MessageSquare,
  Send,
  Inbox,
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Sliders,
  Menu,
  ChevronRight
} from 'lucide-react';
import { deleteUserAction, addUserAction, updateUserPlanAction, changeAdminPasswordAction, replyToContactMessageAction } from '../actions/admin-actions';
import Link from 'next/link';

const PLAN_CONFIG = {
  hobby:  { label: 'Hobby',  badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800',  dot: 'bg-slate-400'  },
  pro:    { label: 'Pro',    badge: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30', dot: 'bg-indigo-500' },
  agency: { label: 'Agency', badge: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30', dot: 'bg-purple-500' },
} as const;
type PlanKey = keyof typeof PLAN_CONFIG;

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  clientCount: number;
  taskCount: number;
  paymentCount: number;
}

interface EmailLogItem {
  id: string;
  to: string;
  subject: string;
  type: string;
  status: string;
  sentAt: string | Date;
}

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  replyText: string;
  repliedAt: string;
  createdAt: string;
}

interface AdminDashboardClientProps {
  initialData: {
    stats: {
      totalUsers: number;
      totalClients: number;
      totalTasks: number;
      globalRevenue: number;
      emailCount: number;
    };
    userRegistry: UserItem[];
    emailLogs: EmailLogItem[];
    contactMessages?: ContactMessageItem[];
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminDashboardClient({ initialData, currentUser }: AdminDashboardClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Search and filter states for User table
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Search and filter states for Email Telemetry
  const [emailSearch, setEmailSearch] = useState('');
  const [emailTypeFilter, setEmailTypeFilter] = useState('all');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Contact Us Messages States
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState('all'); // all, pending, replied
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [messageToReply, setMessageToReply] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'inquiries' | 'telemetry' | 'security'>('overview');

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageToReply || !replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await replyToContactMessageAction(messageToReply.id, replyText);
      if (res.success) {
        triggerToast('success', 'Reply email dispatched and logged successfully!');
        setIsReplyOpen(false);
        setMessageToReply(null);
        setReplyText('');
        startTransition(() => {
          router.refresh();
        });
      } else {
        triggerToast('error', res.message || 'Failed to submit response');
      }
    } catch {
      triggerToast('error', 'An unexpected error occurred while sending reply');
    } finally {
      setIsReplying(false);
    }
  };

  const filteredContactMessages = (initialData.contactMessages || []).filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(contactSearch.toLowerCase()) || 
      msg.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      msg.message.toLowerCase().includes(contactSearch.toLowerCase());
    
    const matchesFilter = 
      contactFilter === 'all' || 
      (contactFilter === 'pending' && !msg.replied) || 
      (contactFilter === 'replied' && msg.replied);

    return matchesSearch && matchesFilter;
  });

  // Add User Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Delete states
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Plan update state
  const [updatingPlanUserId, setUpdatingPlanUserId] = useState<string | null>(null);

  // Change Password states
  const [changePwCurrentPassword, setChangePwCurrentPassword] = useState('');
  const [changePwNewPassword, setChangePwNewPassword] = useState('');
  const [changePwConfirmPassword, setChangePwConfirmPassword] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  // UI Toast messages
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => { setToastMessage(null); }, 4000);
  };

  // Currency formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Date formatter
  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Timestamp formatter for Email logs
  const formatTimestamp = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // User list filtering — now also includes plan filter
  const [planFilter, setPlanFilter] = useState('all');

  const filteredUsers = initialData.userRegistry.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  // Plan distribution counts for the stats card
  const planCounts = initialData.userRegistry.reduce((acc, u) => {
    const p = (u.plan || 'hobby') as PlanKey;
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, { hobby: 0, pro: 0, agency: 0 } as Record<PlanKey, number>);

  // Email logs filtering
  const filteredEmailLogs = initialData.emailLogs.filter(log => {
    const matchesSearch = 
      log.to.toLowerCase().includes(emailSearch.toLowerCase()) || 
      log.subject.toLowerCase().includes(emailSearch.toLowerCase());
    
    const matchesType = 
      emailTypeFilter === 'all' || 
      log.type === emailTypeFilter;

    return matchesSearch && matchesType;
  });

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changePwNewPassword !== changePwConfirmPassword) {
      triggerToast('error', 'New passwords do not match');
      return;
    }
    if (changePwNewPassword.length < 8) {
      triggerToast('error', 'New password must be at least 8 characters');
      return;
    }
    setIsChangingPw(true);
    try {
      const res = await changeAdminPasswordAction({
        currentPassword: changePwCurrentPassword,
        newPassword: changePwNewPassword,
      });
      if (res.success) {
        triggerToast('success', 'Admin password changed successfully!');
        setChangePwCurrentPassword('');
        setChangePwNewPassword('');
        setChangePwConfirmPassword('');
      } else {
        triggerToast('error', res.message || 'Failed to change password');
      }
    } catch {
      triggerToast('error', 'An unexpected error occurred');
    } finally {
      setIsChangingPw(false);
    }
  };

  // Handle Add User Form Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append('name', newUserName);
      formData.append('email', newUserEmail);
      formData.append('password', newUserPassword);
      formData.append('role', newUserRole);

      const response = await addUserAction(null, formData);

      if (response && response.message === 'success') {
        setAddSuccess('User created successfully!');
        // Clear fields
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        
        triggerToast('success', `Created new ${newUserRole} account successfully.`);
        
        // Refresh router context
        startTransition(() => {
          router.refresh();
        });

        // Close modal after delay
        setTimeout(() => {
          setIsAddUserOpen(false);
          setAddSuccess('');
        }, 1000);
      } else {
        setAddError(response?.message || 'Failed to create user account');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setAddError(message);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Plan Change (inline admin override)
  const handlePlanChange = async (userId: string, newPlan: 'hobby' | 'pro' | 'agency') => {
    setUpdatingPlanUserId(userId);
    try {
      const res = await updateUserPlanAction(userId, newPlan);
      if (res.success) {
        triggerToast('success', `Plan updated to ${newPlan} successfully.`);
        startTransition(() => { router.refresh(); });
      } else {
        triggerToast('error', res.message || 'Failed to update plan');
      }
    } catch {
      triggerToast('error', 'An error occurred while updating plan.');
    } finally {
      setUpdatingPlanUserId(null);
    }
  };

  // Handle Delete User Confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteError('');
    setIsDeleting(true);

    try {
      const res = await deleteUserAction(userToDelete.id);
      if (res.success) {
        triggerToast('success', `Deleted user ${userToDelete.email} and all linked workspace assets!`);
        setIsDeleteOpen(false);
        setUserToDelete(null);
        startTransition(() => { router.refresh(); });
      } else {
        setDeleteError(res.message || 'Failed to delete user');
      }
    } catch (err) {
  const message = err instanceof Error ? err.message : 'An error occurred while deleting user';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-indigo-150 dark:selection:bg-indigo-900/30">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[120] p-4.5 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-slide-up ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50/95 border-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/30 dark:text-emerald-350 backdrop-blur-md' 
            : 'bg-rose-50/95 border-rose-100 text-rose-800 dark:bg-rose-950/90 dark:border-rose-900/30 dark:text-rose-350 backdrop-blur-md'
        }`}>
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
            toastMessage.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'
          }`} />
          <p className="text-xs font-bold tracking-tight">{toastMessage.text}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* =========================================================================
            SIDEBAR NAVIGATION (Desktop: lg and up)
           ========================================================================= */}
        <aside className="hidden lg:flex flex-col gap-6 w-72 shrink-0 sticky top-24">
          {/* Console Profile Info */}
          <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2rem] p-6 shadow-sm group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-violet-500/5 opacity-100 pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/20">
                {currentUser.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-slate-50 truncate">{currentUser.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5 truncate">{currentUser.role} console</p>
              </div>
            </div>

            {/* Watchdog status stats */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-450 dark:text-slate-400">
                <span>Database Cluster</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-455 dark:text-slate-400">
                <span>Latency Check</span>
                <span className="font-bold text-emerald-550 dark:text-emerald-400">12ms</span>
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <nav className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2rem] p-4 shadow-sm space-y-1.5">
            {[
              { id: 'overview', label: 'Console Overview', icon: BarChart3 },
              { id: 'users', label: 'Workspace Registry', icon: Users },
              { id: 'inquiries', label: 'Support Inbox', icon: Inbox, badge: filteredContactMessages.filter(m => !m.replied).length },
              { id: 'telemetry', label: 'Email Telemetry', icon: Mail },
              { id: 'security', label: 'Console Security', icon: Lock },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-905 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-350'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-white text-indigo-600' : 'bg-amber-500 text-white animate-pulse'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Quick link button to site */}
          <Link 
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 font-bold text-xs shadow-sm hover:scale-[0.99] transition-all cursor-pointer"
          >
            Launch Landing Page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </aside>

        {/* =========================================================================
            MOBILE VIEW NAVIGATION WORKSPACE (collapses on lg screens)
           ========================================================================= */}
        <div className="lg:hidden w-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[1.8rem] p-2.5 shadow-sm flex items-center justify-around overflow-x-auto gap-2 mb-4 shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Registry', icon: Users },
            { id: 'inquiries', label: 'Inbox', icon: Inbox, badge: filteredContactMessages.filter(m => !m.replied).length },
            { id: 'telemetry', label: 'Telemetry', icon: Mail },
            { id: 'security', label: 'Security', icon: Lock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-850/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-extrabold ${isActive ? 'bg-white text-indigo-600' : 'bg-amber-500 text-white'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            MAIN VIEW WRAPPER (Switches based on activeTab)
           ========================================================================= */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          
          {/* TAB 1: CONSOLE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Header Title Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Administrative Overview</h1>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                    Telemetry status, server latency controls, operational databases, and subscription metrics.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 hover:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Platform User
                  </button>
                </div>
              </div>

              {/* Sandbox Alert */}
              <div className="relative overflow-hidden bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100/80 dark:border-amber-900/35 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4.5 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-450 shrink-0 relative z-10">
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-0.5 relative z-10">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wider">Resend API Sandbox Active</h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Note: The platform is currently operating in <strong className="text-amber-700 dark:text-amber-450">Resend API Sandbox Mode</strong> (using onboarding credentials). Dispatched client reply emails will land directly in your domain's verified email account inbox or <strong className="text-slate-800 dark:text-slate-200 font-bold">Spam / Junk folder</strong>.
                  </p>
                </div>
              </div>

              {/* Statistics Panel Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                
                {/* Metric 1 */}
                <div className="bg-gradient-to-b from-white to-slate-55/40 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Users</span>
                      <p className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {initialData.stats.totalUsers}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider relative z-10">
                    <span>Active accounts</span>
                    <span className="text-indigo-600 dark:text-indigo-455">100% Verified</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-gradient-to-b from-white to-slate-55/40 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">CRM Clients</span>
                      <p className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight group-hover:text-sky-655 dark:group-hover:text-sky-400 transition-colors">
                        {initialData.stats.totalClients}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider relative z-10">
                    <span>Profiles logged</span>
                    <span className="text-sky-600 dark:text-sky-455">Active Pool</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-gradient-to-b from-white to-slate-55/40 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Active Jobs</span>
                      <p className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight group-hover:text-emerald-650 dark:group-hover:text-emerald-400 transition-colors">
                        {initialData.stats.totalTasks}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider relative z-10">
                    <span>Kanban items</span>
                    <span className="text-emerald-600 dark:text-emerald-455">In Progress</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-gradient-to-b from-white to-slate-55/40 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Billing</span>
                      <p className="text-2xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight group-hover:text-amber-650 dark:group-hover:text-amber-400 transition-colors">
                        {formatCurrency(initialData.stats.globalRevenue)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:border-amber-400 shrink-0">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider relative z-10">
                    <span>Platform Pool</span>
                    <span className="text-amber-600 dark:text-amber-455">INR ₹ Pool</span>
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="bg-gradient-to-b from-white to-slate-55/40 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Sent</span>
                      <p className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight group-hover:text-blue-650 dark:group-hover:text-blue-400 transition-colors">
                        {initialData.stats.emailCount}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider relative z-10">
                    <span>Onboardings sent</span>
                    <span className="text-blue-600 dark:text-blue-455">100% Dispatched</span>
                  </div>
                </div>

              </div>

              {/* Visual Telemetry Chart Curve & Resource Monitors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Live Growth Analytics */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Platform Performance Log</h4>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">Growth & Transaction Curve</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Cluster Metrics
                    </span>
                  </div>
                  
                  <div className="h-44 w-full mt-4 flex items-end relative z-10">
                    {/* Dynamic line chart via SVG */}
                    <svg viewBox="0 0 500 150" className="w-full h-full text-indigo-500 dark:text-indigo-455" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area fill */}
                      <path
                        d="M 0 150 L 0 120 Q 75 100 100 80 T 200 90 T 300 45 T 400 30 T 500 10 L 500 150 Z"
                        fill="url(#chartGlow)"
                      />
                      
                      {/* Line */}
                      <path
                        d="M 0 120 Q 75 100 100 80 T 200 90 T 300 45 T 400 30 T 500 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="drop-shadow-[0_4px_10px_rgba(99,102,241,0.35)]"
                      />

                      {/* Highlight nodes */}
                      <circle cx="100" cy="80" r="4.5" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-[3]" />
                      <circle cx="200" cy="90" r="4.5" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-[3]" />
                      <circle cx="300" cy="45" r="4.5" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-[3]" />
                      <circle cx="400" cy="30" r="4.5" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-[3]" />
                      <circle cx="500" cy="10" r="4.5" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-[3]" />
                    </svg>
                  </div>

                  {/* Months labels */}
                  <div className="flex justify-between items-center mt-3.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 relative z-10">
                    <span>Dec</span>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May (Active)</span>
                  </div>
                </div>

                {/* Shard Database Operational load Gauge */}
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Resource Monitor</h4>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">Cluster Database Load</h3>
                  </div>

                  <div className="flex items-center justify-center my-6 relative z-10">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="rgba(226, 232, 240, 0.4)"
                        className="dark:stroke-slate-800/40"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="rgb(99, 102, 241)"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={2 * Math.PI * 46 * (1 - 0.76)}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_rgba(99,102,241,0.35)]"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight">76%</span>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Capacity</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">
                    <span>Shard Pool 3</span>
                    <span className="text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Stable
                    </span>
                  </div>
                </div>

              </div>

              {/* Subscriptions Distributions Block */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Subscription Distribution Pool
                  </h3>
                  <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 mt-1">Relative subscription tier count across active platform workspaces.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(Object.entries(PLAN_CONFIG) as [PlanKey, typeof PLAN_CONFIG[PlanKey]][]).map(([key, cfg]) => {
                    const count = planCounts[key] || 0;
                    const total = Math.max(initialData.stats.totalUsers, 1);
                    const percentage = Math.round((count / total) * 100);
                    
                    return (
                      <div key={key} className={`rounded-2xl p-5.5 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${cfg.badge}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">{cfg.label} Plan</span>
                          <div className={`w-3.5 h-3.5 rounded-full shrink-0 border border-current/25 ${cfg.dot}`} />
                        </div>
                        <div>
                          <p className="text-3xl font-black tracking-tight">{count}</p>
                          <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-0.5">active user workspace accounts</p>
                          
                          {/* Progress Meter bar */}
                          <div className="mt-4 h-1.5 w-full bg-slate-200/55 dark:bg-slate-950/40 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${cfg.dot}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[8px] font-extrabold uppercase mt-1.5 opacity-60">
                            <span>Workspace Ratio</span>
                            <span>{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health and Diagnostics Widgets Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Engine diagnostics */}
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm space-y-4 hover:border-indigo-200 dark:hover:border-indigo-850 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Cpu className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Engine Telemetry</h3>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Node Env</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Production (Release)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Engine Scope</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Next.js v16.2 (Turbopack)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Server Latency</span>
                      <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Stable (12ms)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Database sharding info */}
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm space-y-4 hover:border-sky-200 dark:hover:border-sky-850 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Database className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Database Clusters</h3>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">DB Host Provider</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">MongoDB Atlas (Shared)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Active Shards</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">3 Cluster Shards</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Connection Status</span>
                      <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active (SSL Secured)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Watch Diagnostics */}
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm space-y-4 hover:border-emerald-200 dark:hover:border-emerald-855 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Session Watchdog</h3>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Admin Token</span>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold">AES-256-GCM Locked</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Session Expiration</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">7 Days Lifetime</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">Platform Uptime</span>
                      <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 99.98% Stable
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WORKSPACE REGISTRY (USERS) */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Workspace Database registries</h1>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                    Isolated databases partitioned per user registration profile.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 self-start"
                >
                  <Plus className="h-4 w-4" /> Add Platform User
                </button>
              </div>

              {/* Filter controls panel */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search user name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-405 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                    />
                    {userSearch && (
                      <button 
                        onClick={() => setUserSearch('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-405 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Role filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>

                  {/* Plan filter */}
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="all">All Plans</option>
                    <option value="hobby">Hobby (Free)</option>
                    <option value="pro">Pro</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>

                <span className="px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/35 text-indigo-700 dark:text-indigo-400 rounded-xl font-extrabold text-xs self-start md:self-auto">
                  {filteredUsers.length} Users Found
                </span>
              </div>

              {/* User Directory Table Card */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto xl:overflow-x-visible">
                  {filteredUsers.length > 0 ? (
                    <table className="w-full text-left border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-55/50 dark:bg-slate-950/20 text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                          <th className="py-3 px-3 md:px-4">User</th>
                          <th className="py-3 px-3 md:px-4">Role</th>
                          <th className="py-3 px-3 md:px-4">Joined</th>
                          <th className="py-3 px-2 md:px-3 text-center">Clients</th>
                          <th className="py-3 px-2 md:px-3 text-center">Tasks</th>
                          <th className="py-3 px-2 md:px-3 text-center">Billing</th>
                          <th className="py-3 px-3 md:px-4">Plan</th>
                          <th className="py-3 px-3 md:px-4 text-right pr-4 md:pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredUsers.map((u) => {
                          const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                          const isCurrentAdmin = u.email === currentUser.email;
                          
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/15 transition-colors align-middle">
                              <td className="py-3 px-3 md:px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] border shrink-0 ${
                                    u.role === 'admin'
                                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/35 text-indigo-650 dark:text-indigo-400' 
                                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {initials}
                                  </div>
                                  <div className="min-w-0 max-w-[110px] sm:max-w-[140px] md:max-w-[180px] xl:max-w-[220px]">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 cursor-help" title={u.name}>
                                      <span className="truncate">{u.name}</span>
                                      {isCurrentAdmin && (
                                        <span className="text-[8px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-655 dark:text-emerald-400 border border-emerald-105/30 dark:border-emerald-900/30 px-1 py-0.5 rounded-full uppercase shrink-0">
                                          You
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 truncate cursor-help" title={u.email}>
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 md:px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border tracking-wider ${
                                  u.role === 'admin' 
                                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-105/30 dark:border-indigo-900/30'
                                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                                }`}>
                                  {u.role === 'admin' ? <ShieldCheck className="h-2 w-2" /> : null}
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="py-3 px-3 md:px-4 text-[11px] font-bold text-slate-450 dark:text-slate-400 whitespace-nowrap">
                                {formatDate(u.createdAt)}
                              </td>
                              <td className="py-3 px-2 md:px-3 text-center text-xs font-bold text-slate-900 dark:text-slate-200">
                                {u.clientCount}
                              </td>
                              <td className="py-3 px-2 md:px-3 text-center text-xs font-bold text-slate-900 dark:text-slate-200">
                                {u.taskCount}
                              </td>
                              <td className="py-3 px-2 md:px-3 text-center text-xs font-bold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                                {u.paymentCount}
                              </td>

                              {/* Subscription Plan select dropdown */}
                              <td className="py-3 px-3 md:px-4">
                                {updatingPlanUserId === u.id ? (
                                  <div className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                                    <span className="text-[9px] font-bold text-slate-405 dark:text-slate-555">Syncing…</span>
                                  </div>
                                ) : (
                                  <div className="relative inline-flex items-center">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${PLAN_CONFIG[(u.plan as PlanKey) ?? 'hobby'].dot}`} />
                                    <select
                                      value={u.plan || 'hobby'}
                                      onChange={(e) => handlePlanChange(u.id, e.target.value as 'hobby' | 'pro' | 'agency')}
                                      className={`pl-2.5 pr-6 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 transition-all appearance-none ${
                                        PLAN_CONFIG[(u.plan as PlanKey) ?? 'hobby'].badge
                                      }`}
                                    >
                                      <option value="hobby">Hobby</option>
                                      <option value="pro">Pro</option>
                                      <option value="agency">Agency</option>
                                    </select>
                                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 pointer-events-none text-current opacity-60" />
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 md:px-4 text-right pr-4 md:pr-6">
                                <button
                                  onClick={() => {
                                    if (!isCurrentAdmin) {
                                      setUserToDelete(u);
                                      setIsDeleteOpen(true);
                                    }
                                  }}
                                  disabled={isCurrentAdmin}
                                  title={isCurrentAdmin ? "Safeguard: Cannot delete your own admin session" : "Delete user and cascading workspaces"}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    isCurrentAdmin 
                                      ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 dark:hover:text-rose-450 cursor-pointer'
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center">
                      <Users className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-450">No registry matches found</p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">Try resetting your filter inputs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT MESSAGES SUPPORT INBOX */}
          {activeTab === 'inquiries' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Support Inquiry Center</h1>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Manage contact messages sent from the public website forms and submit direct email replies.
                </p>
              </div>

              {/* Inbox filters bar */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search sender, message..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-405 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                    />
                    {contactSearch && (
                      <button 
                        onClick={() => setContactSearch('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-405 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status select filter */}
                  <select
                    value={contactFilter}
                    onChange={(e) => setContactFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="all">All Inquiries</option>
                    <option value="pending">Pending Response</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>

                <span className="px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/35 text-indigo-700 dark:text-indigo-400 rounded-xl font-extrabold text-xs self-start md:self-auto">
                  {filteredContactMessages.length} Messages
                </span>
              </div>

              {/* Inquiry Cards List */}
              <div className="space-y-4">
                {filteredContactMessages.length > 0 ? (
                  filteredContactMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Ambient light border overlay for pending tickets */}
                      {!msg.replied && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Sender info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{msg.name}</span>
                            {msg.replied ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30">
                                Replied
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border-amber-100 dark:border-amber-900/30">
                                Pending Action
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-405 dark:text-slate-500">{msg.email}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-1">Received {formatTimestamp(msg.createdAt)}</p>
                        </div>

                        {/* Reply Action Trigger */}
                        {!msg.replied && (
                          <button
                            onClick={() => {
                              setMessageToReply(msg);
                              setReplyText('');
                              setIsReplyOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold uppercase border tracking-wider bg-indigo-600 hover:bg-indigo-505 text-white border-transparent transition-colors cursor-pointer self-start md:self-auto shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Draft Reply
                          </button>
                        )}
                      </div>

                      {/* Content block */}
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/70 space-y-4">
                        <div className="space-y-1.5">
                          <h5 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-505 uppercase tracking-widest">Submitted Message</h5>
                          <p className="text-xs font-semibold text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>

                        {/* Sent replies status */}
                        {msg.replied && (
                          <div className="bg-slate-50/80 dark:bg-slate-950/50 border border-slate-150/60 dark:border-slate-850 p-4.5 rounded-2xl space-y-2 mt-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider relative z-10">
                              <span className="text-emerald-650 dark:text-emerald-400 flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Administrator Dispatch Logged
                              </span>
                              <span className="text-slate-400 dark:text-slate-500">Sent {formatDate(msg.repliedAt || msg.createdAt)}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic relative z-10">
                              "{msg.replyText}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/70 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] py-16 text-center">
                    <Inbox className="h-9 w-9 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-450">Inbox is empty</p>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                      Inquiries from the website contact page will show here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Email dispatch registry</h1>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Audit logs of welcome messages, setup configurations, and console responses.
                </p>
              </div>

              {/* Filters Panel */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search recipient email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-60 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-405 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                    />
                    {emailSearch && (
                      <button 
                        onClick={() => setEmailSearch('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-405 dark:text-slate-505 hover:text-slate-650 dark:hover:text-slate-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <select
                    value={emailTypeFilter}
                    onChange={(e) => setEmailTypeFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="all">All Dispatches</option>
                    <option value="Workspace Setup">Workspace Setup</option>
                    <option value="Contact Reply">Contact Reply</option>
                  </select>
                </div>

                <span className="px-3.5 py-2 bg-indigo-50/50 dark:bg-indigo-950/45 border border-indigo-100 dark:border-indigo-900/35 text-indigo-700 dark:text-indigo-400 rounded-xl font-extrabold text-xs self-start md:self-auto">
                  {filteredEmailLogs.length} Records Logged
                </span>
              </div>

              {/* Email dispatch table */}
              <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] shadow-sm overflow-hidden animate-fade-in">
                <div className="overflow-x-auto xl:overflow-x-visible">
                  {filteredEmailLogs.length > 0 ? (
                    <table className="w-full text-left border-collapse table-auto">
                      <thead>
                        <tr className="bg-slate-55/50 dark:bg-slate-950/20 text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                          <th className="py-3 px-3 md:px-4">Log ID</th>
                          <th className="py-3 px-3 md:px-4">Recipient</th>
                          <th className="py-3 px-3 md:px-4">Type</th>
                          <th className="py-3 px-3 md:px-4">Subject</th>
                          <th className="py-3 px-3 md:px-4">Status</th>
                          <th className="py-3 px-3 md:px-4 text-right pr-4 md:pr-6">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredEmailLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/15 transition-colors align-middle">
                            <td className="py-3 px-3 md:px-4 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                              {log.id}
                            </td>
                            <td className="py-3 px-3 md:px-4 text-xs font-bold text-slate-905 dark:text-slate-100 max-w-[120px] md:max-w-[160px] truncate" title={log.to}>
                              {log.to}
                            </td>
                            <td className="py-3 px-3 md:px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${
                                log.type === 'Contact Reply'
                                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-100/30 dark:border-purple-900/30 text-purple-650 dark:text-purple-400'
                                  : 'bg-blue-50 dark:bg-blue-950/30 border-blue-105/30 dark:border-blue-900/30 text-blue-650 dark:text-blue-400'
                              }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 md:px-4 text-xs font-semibold text-slate-505 dark:text-slate-400 max-w-[160px] md:max-w-[220px] truncate" title={log.subject}>
                              {log.subject}
                            </td>
                            <td className="py-3 px-3 md:px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100/30 dark:border-emerald-900/30 text-emerald-650 dark:text-emerald-455 uppercase">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 md:px-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-right pr-4 md:pr-6 whitespace-nowrap">
                              {formatTimestamp(log.sentAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center">
                      <Mail className="h-9 w-9 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-450">No dispatch records found</p>
                      <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 mt-1">System dispatches will be registered here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Console Security Settings</h1>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Manage access keys, administrative credentials, and session logs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Password Change Form */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/65">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/35 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">Change Admin Password</h2>
                      <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 mt-0.5">Modify console access passphrases</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">Current Password</label>
                      <input
                        type="password"
                        value={changePwCurrentPassword}
                        onChange={e => setChangePwCurrentPassword(e.target.value)}
                        required
                        placeholder="Type current console password"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">New Password</label>
                        <input
                          type="password"
                          value={changePwNewPassword}
                          onChange={e => setChangePwNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Min. 8 characters"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">Confirm Password</label>
                        <input
                          type="password"
                          value={changePwConfirmPassword}
                          onChange={e => setChangePwConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Repeat new password"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={isChangingPw}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-505 hover:to-violet-505 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isChangingPw ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                        ) : (
                          <><ShieldCheck className="h-4 w-4" /> Save Password</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Watchdog status card */}
                <div className="bg-white/70 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.2rem] p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/35 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Shield className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Console Watchdog</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Admin Token Type</span>
                      <p className="text-xs font-bold text-slate-805 dark:text-slate-200">Secure AES-256 JWT cookie partition</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Authorized Origin</span>
                      <p className="text-xs font-mono font-bold text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-200/55 dark:border-slate-800/40 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="p-4.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-105/40 dark:border-indigo-900/30 text-xs font-semibold text-slate-505 dark:text-slate-400 leading-relaxed">
                      Security systems verify authorized administrative privileges on every database server request. Password adjustments take effect immediately.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          MODALS & DIALOGS REDESIGNED (Add User, Delete User, Support Reply)
         ========================================================================= */}
      
      {/* MODAL 1: ADD PLATFORM USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-scale-up">
            <button 
              onClick={() => {
                setIsAddUserOpen(false);
                setAddError('');
                setAddSuccess('');
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-450 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-955 dark:text-slate-50 flex items-center gap-2">
                <UserCheck className="h-5.5 w-5.5 text-indigo-500" />
                Add Platform User
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Create workspace registries or administrators</p>
            </div>

            {addError && (
              <div className="p-4.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/35 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="p-4.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/35 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (Min 6 chars)"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-405 dark:placeholder:text-slate-600 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-655 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Security Access Level</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all cursor-pointer"
                >
                  <option value="user">Standard User (Private workspaces)</option>
                  <option value="admin">Platform Administrator (Global console)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE USER CONFIRMATION */}
      {isDeleteOpen && userToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-scale-up">
            <button 
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteError('');
                setUserToDelete(null);
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-450 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/35 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-slate-50">Confirm Cascade Deletion</h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                You are about to delete user <span className="font-extrabold text-slate-900 dark:text-slate-100">{userToDelete.name}</span> (<span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{userToDelete.email}</span>)
              </p>
            </div>

            {deleteError && (
              <div className="p-4.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/35 text-rose-700 dark:text-rose-455 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Warning details log */}
            <div className="p-4.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-805 dark:text-amber-400 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" />
                Warning: Irreversible Purge
              </p>
              <p className="font-semibold leading-relaxed">
                Deleting this account will permanently destroy all associated workspace databases in MongoDB:
              </p>
              <ul className="list-disc pl-5 font-bold space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                <li>{userToDelete.clientCount} Registered CRM Client profiles</li>
                <li>{userToDelete.taskCount} Kanban Deliverable items</li>
                <li>{userToDelete.paymentCount} Logged Billing transactions</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Purging...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REPLY TO CONTACT MESSAGE */}
      {isReplyOpen && messageToReply && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-scale-up">
            <button 
              onClick={() => {
                setIsReplyOpen(false);
                setMessageToReply(null);
                setReplyText('');
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-450 dark:text-slate-505 hover:text-slate-655 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-955 dark:text-slate-50 flex items-center gap-2">
                <MessageSquare className="h-5.5 w-5.5 text-indigo-500" />
                Reply to Inquiry
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Dispatch an email response to this sender</p>
            </div>

            {/* Sender and Message Context */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-405 dark:text-slate-500">Sender Details</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {messageToReply.name} ({messageToReply.email})
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Original Inquiry</span>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {messageToReply.message}
                </p>
              </div>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Your Response Email</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplyOpen(false);
                    setMessageToReply(null);
                    setReplyText('');
                  }}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending Reply...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
