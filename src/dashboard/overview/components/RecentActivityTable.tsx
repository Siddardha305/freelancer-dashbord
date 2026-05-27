'use client'

import React from 'react';
import { ArrowUpRight, Users } from "lucide-react";
import { Client } from '@/types/client';

interface RecentActivityTableProps {
  clients: Client[];
  formatCurrency: (value: number | string) => string;
}

export function RecentActivityTable({ clients, formatCurrency }: RecentActivityTableProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-4 sm:px-8 py-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Client Activity</h2>
        <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 transition-colors flex items-center gap-2">
          View All <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Name</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Niche</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Value</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.slice(0, 5).map((client: Client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-all duration-200 group">
                <td className="px-4 sm:px-6 py-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-indigo-600 font-bold text-lg">{client.name?.charAt(0) || '?'}</span>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {client.id?.slice(-6) || 'XXXXXX'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{client.niche || 'General'}</span>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className="text-sm text-slate-900 font-bold">{formatCurrency(client.monthly_price || 0)}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{client.pricing_model === 'per_thumbnail' ? '/Unit' : '/Mo'}</span>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    (client.status as string) === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {client.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No data available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
