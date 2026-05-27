'use client'

import React from 'react';
import { Users, UserCheck, DollarSign, Clock, Image as ImageIcon } from "lucide-react";
import { KpiCard } from "./KpiCard";

interface MetricsGridProps {
  totalClients: number;
  activeClients: number;
  thisMonthRevenue: string;
  pendingPayments: string;
  pendingPaymentsAmount: number;
  completedWorks: number;
}

export function MetricsGrid({
  totalClients,
  activeClients,
  thisMonthRevenue,
  pendingPayments,
  pendingPaymentsAmount,
  completedWorks
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard title="Total Clients" value={totalClients} icon={Users} trend="All active" />
      <KpiCard title="Active Projects" value={activeClients} icon={UserCheck} trend="In progress" />
      <KpiCard title="Total Revenue" value={thisMonthRevenue} icon={DollarSign} trend="This month" />
      <KpiCard title="Pending" value={pendingPayments} icon={Clock} trend="Awaiting" alert={pendingPaymentsAmount > 0} />
      <KpiCard title="Delivered" value={completedWorks} icon={ImageIcon} trend="Completed" />
    </div>
  );
}
