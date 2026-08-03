'use client'

import React from 'react';
import { format } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from "@/types/client";
import { Work } from "@/types/work";
import { Payment } from "@/types/payment";
import { useState } from "react";

// Modular Sub-Components
import { PayoutHeader } from "./PayoutHeader";
import { ClientPayoutCard } from "./ClientPayoutCard";

interface MonthlyPayoutSummaryProps {
  onCreateInvoice?: (clientName: string, amount: number) => void;
  clients?: Client[];
  works?: Work[];
  payments?: Payment[];
  onSuccess?: () => void;
}

export function MonthlyPayoutSummary({ 
  onCreateInvoice, 
  clients = [],
  works = [],
  payments = [],
  onSuccess
}: MonthlyPayoutSummaryProps) {
  const { formatCurrency } = useCurrency();

  const [timeframe, setTimeframe] = useState<'this_month' | 'last_month' | 'last_3m' | 'last_year'>('this_month');

  const now = new Date();
  
  let monthLabel = format(now, "MMMM yyyy");
  if (timeframe === 'last_month') {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    monthLabel = format(lastMonthDate, "MMMM yyyy");
  } else if (timeframe === 'last_3m') {
    monthLabel = "Last 3 Months";
  } else if (timeframe === 'last_year') {
    monthLabel = "Last Year";
  }

  const clientPayouts = (clients as Client[])
    .map((client: Client) => {
      const clientWorks = (works as Work[]).filter(
        (w: Work) => w.client === client.name
      );

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
      
      let taskStartDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); // Default to start of current month
      let taskEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // End of current month
      
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
      } else if (timeframe === 'last_month') {
        taskStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        taskEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (timeframe === 'last_3m') {
        taskStartDate = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
        taskEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (timeframe === 'last_year') {
        taskStartDate = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0);
        taskEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Completed tasks for current billing period
      const completedThisMonth = clientWorks.filter((w: Work) => {
        if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
        if (client.pricing_model === "per_thumbnail" && w.isPaidByClient) return false;
        const dateStr = w.completedAt || w.updatedAt || w.createdAt;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d > taskStartDate && d <= taskEndDate;
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
      const progress =
        client.pricing_model === "monthly"
          ? (monthlyTarget > 0 ? Math.min(100, Math.round((earnedAmount / monthlyTarget) * 100)) : 0)
          : (quota > 0 ? Math.min(100, Math.round((completedCount / quota) * 100)) : 0);

      return {
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
      };
    });

  const totalPayoutDue = clientPayouts
    .filter((cp) => cp.client.status !== "Inactive")
    .reduce((sum, c) => sum + c.earnedAmount, 0);
  const totalPending = clientPayouts
    .filter((cp) => cp.client.status !== "Inactive")
    .reduce((sum, c) => sum + c.pendingAmount, 0);

  if (clientPayouts.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Cumulative Summary Header */}
      <PayoutHeader 
        monthLabel={monthLabel}
        totalPayoutDue={totalPayoutDue}
        totalPending={totalPending}
        formatCurrency={formatCurrency}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      {/* Responsive Client Payout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clientPayouts.map((cp) => (
          <ClientPayoutCard 
            key={cp.client.id}
            client={cp.client}
            ratePerTask={cp.ratePerTask}
            monthlyTarget={cp.monthlyTarget}
            quota={cp.quota}
            completedCount={cp.completedCount}
            earnedAmount={cp.earnedAmount}
            pendingCount={cp.pendingCount}
            pendingAmount={cp.pendingAmount}
            balanceRemaining={cp.balanceRemaining}
            progress={cp.progress}
            formatCurrency={formatCurrency}
            onCreateInvoice={onCreateInvoice}
          />
        ))}
      </div>
    </section>
  );
}
