'use client'

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  ChevronRight 
} from "lucide-react";
import { Client } from "@/types/client";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ClientPayoutCardProps {
  client: Client;
  ratePerTask: number;
  monthlyTarget: number;
  quota: number;
  completedCount: number;
  earnedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  balanceRemaining: number;
  progress: number;
  formatCurrency: (value: number | string) => string;
  onCreateInvoice?: (clientName: string, amount: number) => void;
}

export function ClientPayoutCard({
  client,
  ratePerTask,
  monthlyTarget,
  quota,
  completedCount,
  earnedAmount,
  pendingCount,
  pendingAmount,
  balanceRemaining,
  progress,
  formatCurrency,
  onCreateInvoice
}: ClientPayoutCardProps) {
  const { terms } = useWorkspace();
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Card Top — Client identity + progress bar */}
      <div className="p-6 pb-4 space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-black text-indigo-600">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-900 truncate">
                  {client.name}
                </p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border select-none ${
                  client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                  (client.status as string) === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                  client.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200/60' :
                  (client.status as string) === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                  'bg-slate-50 text-slate-700 border-slate-200/60'
                }`}>
                  <span className={`h-1 w-1 rounded-full ${
                    client.status === 'Active' ? 'bg-emerald-500' :
                    (client.status as string) === 'On Hold' ? 'bg-amber-500' :
                    client.status === 'Inactive' ? 'bg-red-500' :
                    (client.status as string) === 'Completed' ? 'bg-indigo-500' :
                    'bg-slate-400'
                  }`} />
                  {client.status || 'Active'}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {client.niche || "General"} ·{" "}
                {client.pricing_model === "per_thumbnail"
                  ? terms.perUnitText
                  : "Monthly Retainer"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onCreateInvoice) onCreateInvoice(client.name, earnedAmount);
            }}
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 active:scale-95"
            title="Create Invoice"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {client.pricing_model !== 'per_thumbnail' && (
          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <span>{progress}% of monthly target</span>
              <span>{formatCurrency(monthlyTarget)} target</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Stats Grid */}
      <div className={`grid ${client.pricing_model === 'per_thumbnail' ? 'grid-cols-2' : 'grid-cols-3'} divide-x divide-slate-100`}>
        {/* Completed Orders */}
        <div className="p-4 text-center space-y-1">
          <div className="flex justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-slate-900 tracking-tight">
            {completedCount}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
            Completed
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-4 text-center space-y-1">
          <div className="flex justify-center">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-slate-950 tracking-tight">
            {pendingCount}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
            Pending
          </p>
        </div>

        {/* Quota */}
        {client.pricing_model !== 'per_thumbnail' && (
          <div className="p-4 text-center space-y-1">
            <div className="flex justify-center">
              <Package className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tight">
              {quota}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
              Quota / Mo
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Payout Breakdown */}
      <div className="p-5 space-y-3">
        {/* Rate per task */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" /> Rate / {terms.singular}
          </span>
          <span className="text-xs font-black text-slate-700">
            {formatCurrency(ratePerTask)}
          </span>
        </div>

        {/* Earned */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <Wallet className="h-3 w-3" /> Payout Earned
          </span>
          <span className="text-sm font-black text-emerald-600">
            {formatCurrency(earnedAmount)}
          </span>
        </div>

        {/* Pending amount */}
        {pendingAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> In Pipeline
            </span>
            <span className="text-xs font-black text-amber-600">
              {formatCurrency(pendingAmount)}
            </span>
          </div>
        )}

        {/* Balance remaining */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" /> Balance to Collect
          </span>
          <span
            className={`text-sm font-black ${
              balanceRemaining > 0
                ? "text-indigo-600"
                : "text-emerald-600"
            }`}
          >
            {balanceRemaining > 0
              ? formatCurrency(balanceRemaining)
              : client.pricing_model === 'per_thumbnail'
              ? "₹0"
              : "Fully Earned ✓"}
          </span>
        </div>
      </div>
    </div>
  );
}
