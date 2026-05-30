'use client'

import React from 'react';
import { ArrowUpRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Client } from '@/types/client';
import Link from 'next/link';

interface RecentActivityTableProps {
  clients: Client[];
  formatCurrency: (value: number | string) => string;
}

export function RecentActivityTable({ clients, formatCurrency }: RecentActivityTableProps) {
  return (
    <div className="bg-white dark:bg-slate-950/60 rounded-[2rem] border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 dark:border-slate-800/60 px-4 sm:px-8 py-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Recent Client Activity</h2>
        <Link 
          href="/dashboard/clients" 
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-2"
        >
          View All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/30">
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client Name</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Niche</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan Value</th>
              <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {clients.slice(0, 5).map((client: Client, idx: number) => (
              <motion.tr 
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-200 group"
              >
                <td className="px-4 sm:px-6 py-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{client.name?.charAt(0) || '?'}</span>
                    </div>
                    <div className="ml-5">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">ID: {client.id?.slice(-6) || 'XXXXXX'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">{client.niche || 'General'}</span>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className="text-sm text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(client.monthly_price || 0)}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">{client.pricing_model === 'per_thumbnail' ? '/Unit' : '/Mo'}</span>
                </td>
                <td className="px-4 sm:px-6 py-6">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    client.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' 
                      : (client.status as string) === 'Completed' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30' 
                      : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30'
                  }`}>
                    {client.status || 'Active'}
                  </span>
                </td>
              </motion.tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">No data available</p>
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
