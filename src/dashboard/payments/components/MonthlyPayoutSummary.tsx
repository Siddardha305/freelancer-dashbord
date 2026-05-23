'use client'

import { useQuery } from "@tanstack/react-query";
import { getClientsAction } from "@/dashboard/clients/actions/client-actions";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  AlertCircle,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

export function MonthlyPayoutSummary() {
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

  // Build per-client payout summaries
  const clientPayouts = (clients as any[])
    .map((client: any) => {
      const clientWorks = (works as any[]).filter(
        (w: any) => w.client === client.name
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
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Monthly Payout Summary
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {monthLabel} · Updates every 8 seconds
          </p>
        </div>

        {/* Summary Totals */}
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">
              Total Earned
            </p>
            <p className="text-base font-black text-emerald-700 tracking-tight">
              {formatCurrency(totalPayoutDue)}
            </p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
              In Pipeline
            </p>
            <p className="text-base font-black text-amber-700 tracking-tight">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>
      </div>

      {/* Client Payout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clientPayouts.map(
          ({
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
          }) => (
            <div
              key={client.id}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
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
                          client.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                          client.status === 'Inactive' ? 'bg-red-50 text-red-700 border-red-200/60' :
                          client.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                          'bg-slate-50 text-slate-700 border-slate-200/60'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${
                            client.status === 'Active' ? 'bg-emerald-500' :
                            client.status === 'On Hold' ? 'bg-amber-500' :
                            client.status === 'Inactive' ? 'bg-red-500' :
                            client.status === 'Completed' ? 'bg-indigo-500' :
                            'bg-slate-400'
                          }`} />
                          {client.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {client.niche || "General"} ·{" "}
                        {client.pricing_model === "per_thumbnail"
                          ? "Per Delivery"
                          : "Monthly Retainer"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <span>{client.pricing_model === 'per_thumbnail' ? `${progress}% of monthly quota` : `${progress}% of monthly target`}</span>
                    <span>{client.pricing_model === 'per_thumbnail' ? `${quota} deliveries` : `${formatCurrency(monthlyTarget)} target`}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Stats Grid */}
              <div className="grid grid-cols-3 divide-x divide-slate-100">
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
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    {pendingCount}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                    Pending
                  </p>
                </div>

                {/* Quota */}
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
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Payout Breakdown */}
              <div className="p-5 space-y-3">
                {/* Rate per task */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> Rate / Delivery
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
                      client.pricing_model === 'per_thumbnail'
                        ? "text-slate-400"
                        : balanceRemaining > 0
                        ? "text-indigo-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {client.pricing_model === 'per_thumbnail'
                      ? "₹0 (Per Delivery)"
                      : balanceRemaining > 0
                      ? formatCurrency(balanceRemaining)
                      : "Fully Earned ✓"}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
