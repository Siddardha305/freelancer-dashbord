'use client'

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getClientsAction } from "@/dashboard/clients/actions/client-actions";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import { format } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from "@/types/client";
import { Work } from "@/types/work";

// Modular Sub-Components
import { PayoutHeader } from "./PayoutHeader";
import { ClientPayoutCard } from "./ClientPayoutCard";

interface MonthlyPayoutSummaryProps {
  onCreateInvoice?: (clientName: string, amount: number) => void;
}

export function MonthlyPayoutSummary({ onCreateInvoice }: MonthlyPayoutSummaryProps) {
  const { formatCurrency } = useCurrency();
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

  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy");

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

      // Completed this month
      const completedThisMonth = clientWorks.filter((w: Work) => {
        if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
        const dateStr = w.completedAt || w.updatedAt || w.createdAt;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
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
