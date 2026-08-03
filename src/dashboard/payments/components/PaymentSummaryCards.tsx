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
import { PaymentKpiCard } from './PaymentKpiCard';

interface PaymentSummaryCardsProps {
  payments: Payment[];
  clients?: Client[];
  works?: Work[];
  timeframe?: 'this_month' | 'last_month' | 'last_3m' | 'last_year';
}

export function PaymentSummaryCards({ 
  payments = [],
  clients = [],
  works = [],
  timeframe = 'this_month'
}: PaymentSummaryCardsProps) {
  const { formatCurrency, symbol } = useCurrency();

  const now = new Date();

  // Compute period start and end dates
  let periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  let periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (timeframe === 'last_month') {
    periodStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    periodEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (timeframe === 'last_3m') {
    periodStartDate = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
    periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (timeframe === 'last_year') {
    periodStartDate = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0);
    periodEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Filter payments list by timeframe
  const filteredPayments = payments.filter((p: Payment) => {
    const dateStr = p.invoiceDate || p.createdAt;
    if (!dateStr) return true;
    const d = new Date(dateStr);
    return d >= periodStartDate && d <= periodEndDate;
  });

  // Real-time Invoice Calculations
  const totalCollected = filteredPayments
    .filter((p: Payment) => p.payment_status === "Paid")
    .reduce((acc: number, curr: Payment) => acc + Number(curr.amount), 0);

  const totalPendingInvoices = filteredPayments
    .filter((p: Payment) => p.payment_status === "Pending")
    .reduce((acc: number, curr: Payment) => acc + Number(curr.amount), 0);
  
  const pendingCount = filteredPayments.filter((p: Payment) => p.payment_status === "Pending").length;

  // Real-time Client Payout Calculations
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
    
    let taskStartDate = periodStartDate;
    let taskEndDate = periodEndDate;

    if (timeframe === 'this_month') {
      const unpaidPayments = clientPayments.filter(p => p.payment_status === "Pending" || p.payment_status === "Overdue");
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
    }

    // Completed tasks for current billing period
    const completedThisMonth = clientWorks.filter((w: Work) => {
      if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= taskStartDate && d <= taskEndDate;
    });

    // Pending (To Do / In Progress / Review)
    const pendingWorks = clientWorks.filter((w: Work) =>
      ["To Do", "In Progress", "Review"].includes(w.status)
    );

    const completedCount = completedThisMonth.length;
    const earnedAmount = completedCount * ratePerTask;
    const pendingCountTasks = pendingWorks.length;
    const pendingAmount = pendingCountTasks * ratePerTask;
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
      <PaymentKpiCard 
        title="Payout Earned"
        value={formatCurrency(clientPayoutEarned)}
        icon={CheckCircle2}
        badgeText="Active Deliveries"
        badgeColorClass="text-emerald-600 bg-emerald-50 border-emerald-100"
        badgeIcon={ArrowUpRight}
        badgeIconAnimationClass="animate-bounce"
        iconColorClass="text-emerald-600"
      />

      <PaymentKpiCard 
        title="Balance to Collect"
        value={formatCurrency(clientBalanceToCollect)}
        icon={TrendingUp}
        badgeText="Retainer Target"
        badgeColorClass="text-indigo-600 bg-indigo-50 border-indigo-100"
        iconColorClass="text-indigo-600"
      />

      <PaymentKpiCard 
        title="Total Collected"
        value={formatCurrency(totalCollected)}
        icon={symbol}
        badgeText="Invoiced Success"
        badgeColorClass="text-emerald-600 bg-emerald-50 border-emerald-100"
        iconColorClass="text-emerald-600"
      />

      <PaymentKpiCard 
        title="Pipeline & Pending"
        value={formatCurrency(totalPendingInvoices + clientPipelinePending)}
        icon={Clock}
        badgeText={`${pendingCount} Awaiting Invoice`}
        badgeColorClass="text-amber-600 bg-amber-50 border-amber-100"
        iconColorClass="text-amber-600"
      />
    </div>
  );
}
