'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp 
} from 'lucide-react';
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { getWorksAction } from '@/dashboard/work/actions/work-actions';
import { useCurrency } from '@/context/CurrencyContext';

interface PaymentSummaryCardsProps {
  payments: any[];
}

export function PaymentSummaryCards({ payments = [] }: PaymentSummaryCardsProps) {
  const { formatCurrency } = useCurrency();

  // Fetch real-time active client payouts and pipeline status
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: getClientsAction,
    refetchInterval: 8000,
  });

  const { data: works = [] } = useQuery({
    queryKey: ["works"],
    queryFn: getWorksAction,
    refetchInterval: 8000,
  });

  // Real-time Invoice Calculations
  const totalCollected = payments.filter((p: any) => p.payment_status === "Paid").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const totalPendingInvoices = payments.filter((p: any) => p.payment_status === "Pending").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  
  const pendingCount = payments.filter((p: any) => p.payment_status === "Pending").length;

  // Real-time Client Payout Calculations
  const now = new Date();
  let clientPayoutEarned = 0;
  let clientBalanceToCollect = 0;
  let clientPipelinePending = 0;

  clients.forEach((client: any) => {
    if (client.status === "Inactive") return;

    const clientWorks = works.filter((w: any) => w.client === client.name);

    // Effective rate per task
    const quota = client.thumbnails_per_month || 8;
    const ratePerTask =
      client.price_per_thumbnail > 0
        ? client.price_per_thumbnail
        : quota > 0
        ? (client.monthly_price || 0) / quota
        : 0;

    const monthlyTarget =
      client.pricing_model === "monthly"
        ? client.monthly_price || 0
        : 0;

    // Completed this month
    const completedThisMonth = clientWorks.filter((w: any) => {
      if (w.status !== "Completed" && w.status !== "Done") return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    // Pending (To Do / In Progress / Review)
    const pendingWorks = clientWorks.filter((w: any) =>
      ["To Do", "In Progress", "Review"].includes(w.status)
    );

    const completedCount = completedThisMonth.length;
    const earnedAmount = completedCount * ratePerTask;
    const pendingCount = pendingWorks.length;
    const pendingAmount = pendingCount * ratePerTask;
    const balanceRemaining = Math.max(0, monthlyTarget - earnedAmount);

    clientPayoutEarned += earnedAmount;
    clientBalanceToCollect += balanceRemaining;
    clientPipelinePending += pendingAmount;
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Card 1: Payout Earned */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-emerald-600">
          <CheckCircle2 className="w-24 h-24" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout Earned</p>
        <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter">{formatCurrency(clientPayoutEarned)}</p>
        <div className="mt-6 flex items-center text-[10px] font-bold text-emerald-600 gap-1 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 select-none">
          <ArrowUpRight className="w-3 h-3 animate-bounce" />
          <span>Active Deliveries</span>
        </div>
      </div>

      {/* Card 2: Balance to Collect */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-indigo-600">
          <TrendingUp className="w-24 h-24" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance to Collect</p>
        <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter text-indigo-600">{formatCurrency(clientBalanceToCollect)}</p>
        <div className="mt-6 flex items-center text-[10px] font-bold text-indigo-600 gap-1 uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100 select-none">
          <span>Retainer Target</span>
        </div>
      </div>

      {/* Card 3: Total Collected */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-emerald-600">
          <DollarSign className="w-24 h-24" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Collected</p>
        <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter">{formatCurrency(totalCollected)}</p>
        <div className="mt-6 flex items-center text-[10px] font-bold text-emerald-600 gap-1 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 select-none">
          <span>Invoiced Success</span>
        </div>
      </div>

      {/* Card 4: Pipeline & Pending */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-amber-600">
          <Clock className="w-24 h-24" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline & Pending</p>
        <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter text-amber-600 font-sans">
          {formatCurrency(totalPendingInvoices + clientPipelinePending)}
        </p>
        <div className="mt-6 flex items-center text-[10px] font-bold text-amber-600 gap-1 uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100 select-none">
          <span>{pendingCount} Awaiting Invoice</span>
        </div>
      </div>
    </div>
  );
}
