'use client'

import React from 'react';
import { MessageSquare, Mail, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/shared/Badge";
import { format } from "date-fns";
import { Client } from "@/types/client";

interface ClientMetricsGridProps {
  client: Client;
  now: Date;
  earnedThisMonth: number;
  pendingAmount: number;
  amountBalance: number;
  monthlyPrice: number;
  deliveriesUsed: number;
  monthlyQuota: number;
  deliveriesBalance: number;
  pendingCount: number;
  formatCurrency: (value: number | string) => string;
}

export function ClientMetricsGrid({
  client,
  now,
  earnedThisMonth,
  pendingAmount,
  amountBalance,
  monthlyPrice,
  deliveriesUsed,
  monthlyQuota,
  deliveriesBalance,
  pendingCount,
  formatCurrency
}: ClientMetricsGridProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {client.phone ? (
          <a 
            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors gap-2 sm:gap-3 group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">WhatsApp</span>
          </a>
        ) : (
          <button 
            onClick={() => toast.info("No phone number registered for WhatsApp")}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">WhatsApp</span>
          </button>
        )}

        {client.email ? (
          <a 
            href={`mailto:${client.email}`}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors gap-2 sm:gap-3 group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Email</span>
          </a>
        ) : (
          <button 
            onClick={() => toast.info("No email address registered")}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
              <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Email</span>
          </button>
        )}

        {client.phone ? (
          <a 
            href={`tel:${client.phone}`}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors gap-2 sm:gap-3 group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
              <Phone className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Call</span>
          </a>
        ) : (
          <button 
            onClick={() => toast.info("No phone number registered")}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
          >
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
              <Phone className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Call</span>
          </button>
        )}
      </div>

      {/* Quota & Billing Cycle Tracker */}
      <div className="glass-bg rounded-[2rem] p-6 sm:p-8 border border-card-border overflow-hidden relative space-y-6">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <CreditCard className="h-40 w-40 text-indigo-600" />
        </div>
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Billing & Quota Cycle</h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Current Month Cycle</p>
          </div>
          <Badge variant="success">
            {format(now, "MMMM yyyy")}
          </Badge>
        </div>

        {/* Graphical Visual Segmented Progress Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Earned: {formatCurrency(earnedThisMonth)}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>Pending: {formatCurrency(pendingAmount)}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>Remaining: {formatCurrency(amountBalance)}</span>
          </div>
          
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
            {/* Earned portion */}
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" 
              style={{ width: `${monthlyPrice > 0 ? (earnedThisMonth / monthlyPrice) * 100 : 0}%` }}
              title={`Earned: ${formatCurrency(earnedThisMonth)}`}
            />
            {/* Pending portion */}
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" 
              style={{ width: `${monthlyPrice > 0 ? (pendingAmount / monthlyPrice) * 100 : 0}%` }}
              title={`Pending: ${formatCurrency(pendingAmount)}`}
            />
            {/* Remaining portion */}
            {amountBalance > 0 && (
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-500 opacity-80" 
                style={{ width: `${monthlyPrice > 0 ? (amountBalance / monthlyPrice) * 100 : 100}%` }}
                title={`Remaining: ${formatCurrency(amountBalance)}`}
              />
            )}
          </div>
          
          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>0%</span>
            <span>Target Contract Price: {formatCurrency(monthlyPrice)}</span>
            <span>100%</span>
          </div>
        </div>

        {/* Dynamic Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Deliveries Quota balance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliveries Quota</span>
              <Badge variant={deliveriesBalance > 0 ? "success" : "warning"}>
                {deliveriesBalance} Left
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{deliveriesUsed}</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">/ {monthlyQuota} Deliveries</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              {deliveriesBalance} remaining this month
            </p>
          </div>

          {/* Pending Amount card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Amount</span>
              <Badge variant={pendingCount > 0 ? "warning" : "outline"}>
                {pendingCount} Tasks
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{formatCurrency(pendingAmount)}</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              Adds when tasks are in progress
            </p>
          </div>

          {/* Amount Remaining balance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Balance</span>
              <Badge variant="info">
                Remaining
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatCurrency(amountBalance)}</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              Decrements as tasks complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
