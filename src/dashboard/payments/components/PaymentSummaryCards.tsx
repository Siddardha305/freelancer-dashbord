'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  TrendingUp 
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { Client } from '@/types/client';
import { Work } from '@/types/work';
import { Payment } from '@/types/payment';

interface PaymentSummaryCardsProps {
  payments: Payment[];
  clients?: Client[];
  works?: Work[];
}

export function PaymentSummaryCards({ 
  payments = [],
  clients = [],
  works = []
}: PaymentSummaryCardsProps) {
  const { formatCurrency, symbol } = useCurrency();

  // Real-time Invoice Calculations
  const totalCollected = payments.filter((p: Payment) => p.payment_status === "Paid").reduce((acc: number, curr: Payment) => acc + Number(curr.amount), 0);
  const totalPendingInvoices = payments.filter((p: Payment) => p.payment_status === "Pending").reduce((acc: number, curr: Payment) => acc + Number(curr.amount), 0);
  
  const pendingCount = payments.filter((p: Payment) => p.payment_status === "Pending").length;

  // Real-time Client Payout Calculations
  const now = new Date();
  let clientPayoutEarned = 0;
  let clientBalanceToCollect = 0;
  let clientPipelinePending = 0;

  (clients as Client[]).forEach((client: Client) => {
    if (client.status === "Inactive") return;

    const clientWorks = (works as Work[]).filter((w: Work) => w.client === client.name);

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
        : quota * ratePerTask;

    // Rolling task start date calculation based on paid/unpaid invoice history
    const clientPayments = payments.filter(p => p.client === client.name);
    const unpaidPayments = clientPayments.filter(p => p.payment_status === "Pending" || p.payment_status === "Overdue");
    
    let taskStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); // Default to start of current month
    
    if (unpaidPayments.length > 0) {
      // If there are unpaid invoices, roll over and include all tasks since the earliest unpaid invoice month
      let earliestUnpaidDate = new Date();
      unpaidPayments.forEach(p => {
        const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date());
        if (d < earliestUnpaidDate) {
          earliestUnpaidDate = d;
        }
      });
      taskStartDate = new Date(earliestUnpaidDate.getFullYear(), earliestUnpaidDate.getMonth(), 1, 0, 0, 0, 0);
    } else {
      // If fully paid, only count tasks completed after the latest paid invoice date
      const paidPayments = clientPayments.filter(p => p.payment_status === "Paid");
      if (paidPayments.length > 0) {
        let latestPaidDate = new Date(0);
        paidPayments.forEach(p => {
          const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date(0));
          if (d > latestPaidDate) {
            latestPaidDate = d;
          }
        });
        taskStartDate = latestPaidDate;
      }
    }

    // Completed tasks for current billing period
    const completedThisMonth = clientWorks.filter((w: Work) => {
      if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d > taskStartDate;
    });

    // Pending (To Do / In Progress / Review)
    const pendingWorks = clientWorks.filter((w: Work) =>
      ["To Do", "In Progress", "Review"].includes(w.status)
    );

    const completedCount = completedThisMonth.length;
    const earnedAmount = completedCount * ratePerTask;
    const pendingCount = pendingWorks.length;
    const pendingAmount = pendingCount * ratePerTask;
    const balanceRemaining =
      client.pricing_model === "monthly"
        ? Math.max(0, monthlyTarget - earnedAmount)
        : earnedAmount;

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
        <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-emerald-600 select-none">
          <span className="text-8xl font-black tracking-tighter block leading-none mr-2 mt-2">{symbol}</span>
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
