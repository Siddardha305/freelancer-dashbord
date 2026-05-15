'use client'

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Clock, 
  Image as ImageIcon,
  ArrowUpRight,
  Zap,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { getClientsAction } from '@/features/clients/actions/client-actions';
import { getWorksAction } from '@/features/work/actions/work-actions';
import { getPaymentsAction } from '@/features/payments/actions/payment-actions';

export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, worksData, paymentsData] = await Promise.all([
          getClientsAction(),
          getWorksAction(),
          getPaymentsAction()
        ]);
        setClients(clientsData);
        setWorks(worksData);
        setPayments(paymentsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    // Enable 5-second live polling for real-time synchronization
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === "Active").length;
  
  const thisMonthRevenue = payments
    .filter((p: any) => p.payment_status === "Paid")
    .reduce((acc, p: any) => acc + Number(p.amount), 0);

  const pendingPayments = clients
    .filter((c: any) => c.status === "Active")
    .reduce((acc, c: any) => acc + Number(c.monthly_price || 0), 0);

  const completedWorks = works.filter((w: any) => w.status === "Completed").length;
  const completionRate = works.length > 0 ? Math.round((completedWorks / works.length) * 100) : 0;

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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <header className="flex h-20 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200 bg-white px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</span>
            <span className="text-sm font-semibold text-slate-900">Admin Manager</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
            <span className="text-sm font-bold text-slate-600">A</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          
          {/* Main Highlights */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard title="Total Clients" value={totalClients} icon={Users} trend="All active" />
            <KpiCard title="Active Projects" value={activeClients} icon={UserCheck} trend="In progress" />
            <KpiCard title="Total Revenue" value={`₹${thisMonthRevenue}`} icon={DollarSign} trend="Collected" />
            <KpiCard title="Pending" value={`₹${pendingPayments}`} icon={Clock} trend="Awaiting" alert={pendingPayments > 0} />
            <KpiCard title="Delivered" value={completedWorks} icon={ImageIcon} trend="Completed" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Revenue Analytics */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Revenue Performance</h2>
                   <p className="text-xs text-slate-500 font-medium">Monthly collection trends</p>
                 </div>
                 <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                 </div>
               </div>

               <div className="flex items-end justify-between h-56 gap-4">
                 {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, i) => {
                   const height = thisMonthRevenue > 0 ? (30 + (i * 12)) : 10; 
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                       <div className="w-full flex flex-col justify-end items-center h-full">
                         <div 
                           className="w-full max-w-[40px] bg-slate-100 rounded-2xl transition-all duration-300 group-hover/bar:bg-indigo-600 group-hover/bar:scale-105 relative group/tip"
                           style={{ height: `${height}%` }}
                         >
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                             ₹{(thisMonthRevenue / 6 * (i+1)).toFixed(0)}
                           </div>
                         </div>
                       </div>
                       <span className="text-[10px] text-slate-500 font-bold tracking-wider group-hover/bar:text-indigo-600 transition-colors">{month}</span>
                     </div>
                   )
                 })}
               </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-10 left-10 p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                <Zap className="h-5 w-5" />
              </div>
              
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-8">System Efficiency</h2>
              
              <div className="relative h-48 w-48 mb-8">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
                  <circle 
                    className="text-indigo-600 stroke-current" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    cx="50" cy="50" r="42" 
                    fill="transparent" 
                    strokeDasharray="263.8" 
                    strokeDashoffset={263.8 - (263.8 * completionRate / 100)} 
                    transform="rotate(-90 50 50)" 
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-slate-900 tracking-tighter">{completionRate}%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Completed</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 font-medium max-w-[200px]">Overall project delivery success rate for active clients.</p>
            </div>
          </div>

          {/* Detailed Network Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-10 py-8 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Client Activity</h2>
              <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 transition-colors flex items-center gap-2">
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Name</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Niche</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Value</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.slice(0, 5).map((client: any) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-all duration-200 group">
                      <td className="px-10 py-6">
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
                      <td className="px-10 py-6">
                        <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{client.niche || 'General'}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-sm text-slate-900 font-bold">₹{client.monthly_price || 0}</span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{client.pricing_model === 'per_thumbnail' ? '/Unit' : '/Mo'}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          client.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
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
        </div>
      </main>
    </div>
  );
}


