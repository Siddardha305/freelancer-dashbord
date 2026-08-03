'use client'

import React from 'react';
import { Users, Film, DollarSign, Clock, Image as ImageIcon } from "lucide-react";
import { KpiCard } from "./KpiCard";

interface MetricsGridProps {
  totalClients: number;
  activeClients: number;
  thisMonthRevenue: string;
  pendingPayments: string;
  pendingPaymentsAmount: number;
  completedWorks: number;
  onCardClick?: (type: 'clients' | 'active_projects' | 'revenue' | 'pending' | 'delivered') => void;
}

export function MetricsGrid({
  totalClients,
  activeClients,
  thisMonthRevenue,
  pendingPayments,
  pendingPaymentsAmount,
  completedWorks,
  onCardClick
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard title="Creator Brands" value={totalClients} icon={Users} trend="Partner channels" onClick={() => onCardClick?.('clients')} />
      <KpiCard title="Active Projects" value={activeClients} icon={Film} trend="In progress edits" onClick={() => onCardClick?.('active_projects')} />
      <KpiCard title="Studio Revenue" value={thisMonthRevenue} icon={DollarSign} trend="This month" onClick={() => onCardClick?.('revenue')} />
      <KpiCard title="Pending" value={pendingPayments} icon={Clock} trend="Awaiting payouts" alert={pendingPaymentsAmount > 0} onClick={() => onCardClick?.('pending')} />
      <KpiCard title="Delivered Edits" value={completedWorks} icon={ImageIcon} trend="Completed visuals" onClick={() => onCardClick?.('delivered')} />
    </div>
  );
}
