'use client';

import React, { useState } from 'react';
import { X, Search, Briefcase, Users, DollarSign, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Client } from '@/types/client';
import { Work } from '@/types/work';
import { ClientAvatar } from '@/dashboard/clients/ClientAvatar';

interface MetricsDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: 'clients' | 'active_projects' | 'revenue' | 'pending' | 'delivered' | null;
  clients: Client[];
  works: Work[];
  formatCurrency: (value: number) => string;
}

export function MetricsDetailDrawer({
  isOpen,
  onClose,
  metricType,
  clients,
  works,
  formatCurrency,
}: MetricsDetailDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !metricType) return null;

  // Build lookup mapping client name -> client object
  const clientMap: Record<string, Client> = {};
  clients.forEach((c) => {
    clientMap[c.name] = c;
  });

  const getPricePerTask = (work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.status === 'Inactive') return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  const now = new Date();

  // Filter items based on metricType
  let drawerTitle = '';
  let drawerSubtitle = '';
  let itemsCountText = '';
  let iconColorClass = '';
  let IconComponent = Briefcase;

  let renderedContent = null;

  if (metricType === 'clients') {
    drawerTitle = 'Creator Brands';
    drawerSubtitle = 'Full list of active partner channels';
    IconComponent = Users;
    iconColorClass = 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20';

    const filteredClients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.niche && c.niche.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    itemsCountText = `${filteredClients.length} Channels`;

    renderedContent = (
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const isPerDelivery = client.pricing_model === 'per_thumbnail';
          const rateVal = isPerDelivery ? client.price_per_thumbnail : client.monthly_price;
          return (
            <div
              key={client.id}
              className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <ClientAvatar name={client.name} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md">
                    {client.niche || 'General'}
                  </span>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-1">{client.name}</h5>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  {formatCurrency(rateVal || 0)}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  {isPerDelivery ? 'Per Delivery' : 'Retainer'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (metricType === 'active_projects') {
    drawerTitle = 'Active Projects';
    drawerSubtitle = 'Tasks currently under development or review';
    IconComponent = Briefcase;
    iconColorClass = 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-955/20';

    const activeTasks = works.filter(
      (w) =>
        ['To Do', 'In Progress', 'Review'].includes(w.status) &&
        (w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.client.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    itemsCountText = `${activeTasks.length} Active Tasks`;

    renderedContent = (
      <div className="space-y-4">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-955/20 px-2 py-0.5 rounded-md">
                {task.client}
              </span>
              <h5 className="text-sm font-bold text-slate-850 dark:text-white truncate mt-1">{task.title}</h5>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-md bg-cyan-50 text-cyan-700 border-cyan-100">
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (metricType === 'revenue') {
    drawerTitle = 'Studio Revenue Breakdown';
    drawerSubtitle = 'Completed tasks this month contributing to revenue';
    IconComponent = DollarSign;
    iconColorClass = 'text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';

    const revenueTasks = works.filter((w) => {
      if ((w.status as string) !== 'Completed' && w.status !== 'Done') return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const isThisMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      const matchesSearch =
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.client.toLowerCase().includes(searchQuery.toLowerCase());
      return isThisMonth && matchesSearch;
    });

    itemsCountText = `${revenueTasks.length} Completed Tasks`;

    renderedContent = (
      <div className="space-y-4">
        {revenueTasks.map((task) => {
          const taskRate = getPricePerTask(task);
          return (
            <div
              key={task.id}
              className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-black text-emerald-650 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                  {task.client}
                </span>
                <h5 className="text-sm font-bold text-slate-855 dark:text-white truncate mt-1">{task.title}</h5>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(taskRate)}</p>
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Completed</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (metricType === 'pending') {
    drawerTitle = 'Pending Deliverables';
    drawerSubtitle = 'Awaiting delivery completions and invoicing values';
    IconComponent = Clock;
    iconColorClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/20';

    const pendingTasks = works.filter(
      (w) =>
        ['To Do', 'In Progress', 'Review'].includes(w.status) &&
        (w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.client.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    itemsCountText = `${pendingTasks.length} Awaiting Payouts`;

    renderedContent = (
      <div className="space-y-4">
        {pendingTasks.map((task) => {
          const taskRate = getPricePerTask(task);
          return (
            <div
              key={task.id}
              className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-black text-amber-600 dark:text-amber-450 uppercase tracking-widest bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded-md">
                  {task.client}
                </span>
                <h5 className="text-sm font-bold text-slate-850 dark:text-white truncate mt-1">{task.title}</h5>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(taskRate)}</p>
                <span className="inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-md bg-amber-50 text-amber-700 border-amber-100 mt-0.5">
                  {task.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (metricType === 'delivered') {
    drawerTitle = 'Delivered Edits';
    drawerSubtitle = 'All-time completed visual deliverables';
    IconComponent = CheckCircle2;
    iconColorClass = 'text-purple-650 dark:text-purple-400 bg-purple-50 dark:bg-purple-955/20';

    const completedAllTime = works.filter(
      (w) =>
        ((w.status as string) === 'Completed' || w.status === 'Done') &&
        (w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.client.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    itemsCountText = `${completedAllTime.length} Total Deliveries`;

    renderedContent = (
      <div className="space-y-4">
        {completedAllTime.map((task) => {
          const taskRate = getPricePerTask(task);
          return (
            <div
              key={task.id}
              className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-black text-purple-650 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-955/20 px-2 py-0.5 rounded-md">
                  {task.client}
                </span>
                <h5 className="text-sm font-bold text-slate-850 dark:text-white truncate mt-1">{task.title}</h5>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(taskRate)}</p>
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Completed</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200/50 dark:border-slate-800 shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {drawerTitle}
              </h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {drawerSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          
          {/* Search bar inside drawer */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${drawerTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Count banner */}
          <div className="flex items-center justify-between select-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {itemsCountText}
            </span>
          </div>

          {/* List items */}
          <div className="overflow-y-auto max-h-[60vh] pr-1">
            {renderedContent}
          </div>
        </div>
      </div>
    </div>
  );
}
