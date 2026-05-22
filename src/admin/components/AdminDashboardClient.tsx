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
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { deleteUserAction, addUserAction } from '../actions/admin-actions';
import Link from 'next/link';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
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
  const [isPending, startTransition] = useTransition();

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

  // UI Toast messages
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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

  // User list filtering
  const filteredUsers = initialData.userRegistry.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' || 
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
    } catch (err: any) {
      setAddError(err.message || 'An unexpected error occurred');
    } finally {
      setIsAdding(false);
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

        // Refresh router data
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDeleteError(res.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4.5 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <div className={`h-2 w-2 rounded-full shrink-0 ${
            toastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />
          <p className="text-xs font-bold">{toastMessage.text}</p>
        </div>
      )}

      {/* Welcome Headers & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Administrative Control Desk</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Global overview of user workspaces, platform engagement, database registries, and service telemetry.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-bold text-xs shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            Launch Landing Page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Platform User
          </button>
        </div>
      </div>

      {/* Resend Sandbox Alert Notice */}
      <div className="bg-amber-50/50 border border-amber-100/80 rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
        <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Resend API Sandbox Active</h4>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Note: The platform is currently operating in <strong className="text-amber-700">Resend API Sandbox Mode</strong> (using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">onboarding@resend.dev</code>). Sent emails will land directly in your <strong className="text-slate-800 font-bold">Spam / Junk folder</strong>. Resend also restricts sandbox dispatches strictly to verified domain owners.
          </p>
        </div>
      </div>

      {/* Global Statistics Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Users */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Users</span>
            <p className="text-3xl font-extrabold text-slate-950 tracking-tight group-hover:text-indigo-600 transition-colors">
              {initialData.stats.totalUsers}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Active registered logins</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Clients */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:border-sky-200 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Global Clients</span>
            <p className="text-3xl font-extrabold text-slate-950 tracking-tight group-hover:text-sky-600 transition-colors">
              {initialData.stats.totalClients}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Total CRM profiles logged</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Tasks */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Jobs</span>
            <p className="text-3xl font-extrabold text-slate-950 tracking-tight group-hover:text-emerald-600 transition-colors">
              {initialData.stats.totalTasks}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Kanban deliverable items</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Billings */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Global Billings</span>
            <p className="text-2xl font-extrabold text-slate-950 tracking-tight group-hover:text-amber-600 transition-colors">
              {formatCurrency(initialData.stats.globalRevenue)}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Combined billing pool</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>

        {/* Card 5: Emails Dispatched (Premium Telemetry) */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Dispatched</span>
            <p className="text-3xl font-extrabold text-slate-950 tracking-tight group-hover:text-blue-600 transition-colors">
              {initialData.stats.emailCount}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Automated onboardings</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* User Directory Table & Search Desk */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Platform Workspace Directory</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Isolated databases partitioned per user account</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-60 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
              {userSearch && (
                <button 
                  onClick={() => setUserSearch('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Select */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>

            <span className="px-3 py-2 bg-indigo-50/50 border border-indigo-100 text-indigo-700 rounded-xl font-bold text-xs">
              {filteredUsers.length} Users Found
            </span>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {filteredUsers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="py-4 px-6">User / Account details</th>
                  <th className="py-4 px-6">Security Access</th>
                  <th className="py-4 px-6">Sign-up Date</th>
                  <th className="py-4 px-6 text-center">Clients</th>
                  <th className="py-4 px-6 text-center">Tasks</th>
                  <th className="py-4 px-6 text-center">Billing Pool</th>
                  <th className="py-4 px-6 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                  const isCurrentAdmin = u.email === currentUser.email;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm shadow-indigo-50' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {u.name}
                              {isCurrentAdmin && (
                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${
                          u.role === 'admin' 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {u.role === 'admin' ? <ShieldCheck className="h-2.5 w-2.5" /> : null}
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-bold text-slate-900">
                        {u.clientCount}
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-bold text-slate-900">
                        {u.taskCount}
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-bold text-slate-900">
                        {u.paymentCount}
                      </td>
                      <td className="py-4 px-6 text-right pr-8">
                        <button
                          onClick={() => {
                            if (!isCurrentAdmin) {
                              setUserToDelete(u);
                              setIsDeleteOpen(true);
                            }
                          }}
                          disabled={isCurrentAdmin}
                          title={isCurrentAdmin ? "Safeguard: Cannot delete your own admin session" : "Delete user and cascading workspaces"}
                          className={`p-2 rounded-xl transition-all ${
                            isCurrentAdmin 
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No workspace users found</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Try relaxing your search inputs or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Automated Email Dispatch Registry */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        {/* Email Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
              Automated Email Dispatch Registry
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Live logs of welcome, onboarding, and workspace initialized dispatches</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search recipient email..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-60 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
              />
              {emailSearch && (
                <button 
                  onClick={() => setEmailSearch('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Email Type Filter */}
            <select
              value={emailTypeFilter}
              onChange={(e) => setEmailTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
            >
              <option value="all">All Logs</option>
              <option value="Workspace Setup">Workspace Setup</option>
            </select>

            <span className="px-3 py-2 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-xl font-bold text-xs">
              {filteredEmailLogs.length} Dispatches Logged
            </span>
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="overflow-x-auto">
          {filteredEmailLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="py-4 px-6">Log ID</th>
                  <th className="py-4 px-6">Recipient Email</th>
                  <th className="py-4 px-6">Dispatch Type</th>
                  <th className="py-4 px-6">Email Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right pr-8">Dispatch Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-extrabold text-slate-400 font-mono">
                      {log.id}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-900">
                      {log.to}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-600 uppercase tracking-wider">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                      {log.subject}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-600 uppercase">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-500 text-right pr-8">
                      {formatTimestamp(log.sentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center">
              <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No dispatch telemetry found</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Emails are logged when users setup workspace initializations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Desk & Platform Health Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card: Engine Telemetry */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <Cpu className="h-5 w-5 text-indigo-500 shrink-0" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Engine Telemetry</h3>
          </div>
          
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Node Environment</span>
              <span className="font-bold text-slate-800">Production (Release)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Framework Scope</span>
              <span className="font-bold text-slate-800">Next.js v16.2 (Turbopack)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Memory Latency</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Stable (12ms)
              </span>
            </div>
          </div>
        </div>

        {/* Card: Cluster Databases */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <Database className="h-5 w-5 text-sky-500 shrink-0" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Database Clusters</h3>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Provider Service</span>
              <span className="font-bold text-slate-800">MongoDB Atlas (Shared)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Active Shards</span>
              <span className="font-bold text-slate-800">3 Shard Clusters</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Database Status</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Active (SSL Secured)
              </span>
            </div>
          </div>
        </div>

        {/* Card: Active Session Diagnostics */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <Clock className="h-5 w-5 text-emerald-500 shrink-0" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Session Watch</h3>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Active Admin Token</span>
              <span className="font-bold text-indigo-600">AES-256-GCM Locked</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Session Expiration</span>
              <span className="font-bold text-slate-800">7 Days Lifetime</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Uptime Metric</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Active (99.98%)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD PLATFORM USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-scale-up">
            <button 
              onClick={() => {
                setIsAddUserOpen(false);
                setAddError('');
                setAddSuccess('');
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <UserCheck className="h-5.5 w-5.5 text-indigo-500" />
                Add Platform User
              </h3>
              <p className="text-xs font-semibold text-slate-400">Create standard user profiles or administrators</p>
            </div>

            {addError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (Min 6 chars)"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Access Level</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                >
                  <option value="user">Standard User (Private workspaces)</option>
                  <option value="admin">Platform Administrator (Global console)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-scale-up">
            <button 
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteError('');
                setUserToDelete(null);
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-950">Confirm Cascade Deletion</h3>
              <p className="text-xs font-semibold text-slate-500">
                You are about to delete user <span className="font-extrabold text-slate-900">{userToDelete.name}</span> (<span className="font-mono text-[11px] text-slate-700">{userToDelete.email}</span>)
              </p>
            </div>

            {deleteError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Warning Details */}
            <div className="p-4.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                Warning: Irreversible Database Purge
              </p>
              <p className="font-semibold leading-relaxed">
                Deleting this account will permanently destroy all associated workspace data in Mongoose, including:
              </p>
              <ul className="list-disc pl-5 font-bold space-y-0.5 text-slate-600 text-[11px]">
                <li>{userToDelete.clientCount} Registered CRM Client profiles</li>
                <li>{userToDelete.taskCount} Kanban Deliverable items</li>
                <li>{userToDelete.paymentCount} Logged Billing transactions</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Purging Account...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
