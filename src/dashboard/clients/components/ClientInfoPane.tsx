'use client'

import React from 'react';
import { AlertCircle } from "lucide-react";
import { Client } from "@/types/client";

interface ClientInfoPaneProps {
  client: Client;
  isExpiringSoon: boolean;
  formatCurrency: (value: number | string) => string;
}

export function ClientInfoPane({
  client,
  isExpiringSoon,
  formatCurrency
}: ClientInfoPaneProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Contract & Revenue */}
      <div className="premium-card rounded-[2rem] p-6 sm:p-8 space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Project Details</h3>
          {isExpiringSoon && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-red-100 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold">Contract Expires Soon</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Model</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{client.pricing_model === 'per_thumbnail' ? 'Per Thumbnail' : 'Monthly Retainer'}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rate</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(client.monthly_price || client.price_per_thumbnail)}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{client.contractStartDate ? new Date(client.contractStartDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</p>
            <p className={`text-xs sm:text-sm font-bold ${isExpiringSoon ? 'text-red-600' : 'text-slate-900'}`}>
              {client.contractEndDate ? new Date(client.contractEndDate).toLocaleDateString() : 'Continuous'}
            </p>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned LTV</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(client.totalEarned || 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900">{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="premium-card rounded-[2rem] p-6 sm:p-8">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Internal Notes</h3>
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 min-h-[120px] sm:min-h-[150px] text-xs sm:text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
          {client.notes || "No internal notes available for this client. Click edit to add details about workflow, preferences, or communication style."}
        </div>
      </div>
    </div>
  );
}
