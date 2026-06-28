'use client'

import React, { useEffect, useState } from 'react';
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { getWorksAction } from '@/dashboard/work/actions/work-actions';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from '@/types/client';
import { Work } from '@/types/work';
import { useRouter } from 'next/navigation';

// Modular Sub-Components
import { DashboardHeader } from "@/dashboard/overview/components/DashboardHeader";
import { MetricsGrid } from "@/dashboard/overview/components/MetricsGrid";
import { RevenuePerformanceChart } from "@/dashboard/overview/components/RevenuePerformanceChart";
import { SystemEfficiencyCircle } from "@/dashboard/overview/components/SystemEfficiencyCircle";
import { RecentActivityTable } from "@/dashboard/overview/components/RecentActivityTable";

export default function Home() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role?: string; currency?: string; teamRole?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, worksData, userData] = await Promise.all([
          getClientsAction(),
          getWorksAction(),
          getCurrentUserAction()
        ]);
        
        if (userData?.teamRole === 'editor') {
          router.replace('/dashboard/work');
          return;
        }

        setClients(clientsData);
        setWorks(worksData);
        setCurrentUser(userData);
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
  const activeClients = clients.filter((c: Client) => c.status === "Active").length;

  // Build a lookup: client name → client object
  const clientMap: Record<string, Client> = {};
  clients.forEach((c: Client) => { clientMap[c.name] = c; });

  // Helper: get effective price per thumbnail for a task's client
  const getPricePerTask = (work: Work): number => {
    const c = clientMap[work.client];
    if (!c) return 0;
    if (c.status === "Inactive") return 0;
    if (c.price_per_thumbnail > 0) return c.price_per_thumbnail;
    const quota = c.thumbnails_per_month || 8;
    return quota > 0 ? (c.monthly_price || 0) / quota : 0;
  };

  // TOTAL REVENUE: completed/done tasks this calendar month × their rate
  const now = new Date();
  const completedThisMonth = works.filter((w: Work) => {
    if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
    const dateStr = w.completedAt || w.updatedAt || w.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = completedThisMonth.reduce(
    (acc: number, w: Work) => acc + getPricePerTask(w), 0
  );


  // PENDING: tasks still To Do / In Progress / Review
  const pendingWorks = works.filter((w: Work) =>
    ["To Do", "In Progress", "Review"].includes(w.status)
  );
  const pendingPayments = pendingWorks.reduce(
    (acc: number, w: Work) => acc + getPricePerTask(w), 0
  );

  // DELIVERED: all-time completed or done tasks
  const completedWorks = works.filter((w: Work) =>
    (w.status as string) === "Completed" || w.status === "Done"
  ).length;

  const completionRate = works.length > 0
    ? Math.round((completedWorks / works.length) * 100)
    : 0;

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
      <DashboardHeader userName={currentUser?.name || 'Admin Manager'} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* Main Highlights */}
          <MetricsGrid 
            totalClients={totalClients}
            activeClients={activeClients}
            thisMonthRevenue={formatCurrency(thisMonthRevenue)}
            pendingPayments={formatCurrency(pendingPayments)}
            pendingPaymentsAmount={pendingPayments}
            completedWorks={completedWorks}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Revenue Analytics */}
            <RevenuePerformanceChart 
              works={works}
              clients={clients}
              formatCurrency={formatCurrency}
            />

            {/* Performance Stats */}
            <SystemEfficiencyCircle completionRate={completionRate} />
          </div>

          {/* Detailed Network Table */}
          <RecentActivityTable clients={clients} formatCurrency={formatCurrency} />
        </div>
      </main>
    </div>
  );
}
