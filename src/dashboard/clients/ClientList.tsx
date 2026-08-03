'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deleteClientAction } from "@/dashboard/clients/client-actions";
import { ClientRow } from "./ClientRow";

import { Client } from "@/types/client";
import { Work } from "@/types/work";
import { Payment } from "@/types/payment";

const statusConfig: Record<string, { label: string; dot: string; row: string; badge: string }> = {
  Active: {
    label: "Active",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
  },
  "On Hold": {
    label: "On Hold",
    dot: "bg-amber-500",
    row: "hover:bg-amber-50/30 dark:hover:bg-amber-950/10",
    badge: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
  },
  Inactive: {
    label: "Inactive",
    dot: "bg-slate-300",
    row: "hover:bg-slate-50/50 dark:hover:bg-slate-900/20",
    badge: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
  },
  Completed: {
    label: "Completed",
    dot: "bg-indigo-500",
    row: "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30",
  },
};

interface ClientListProps {
  clients?: Client[];
  onViewProfile?: (client: Client) => void;
}

export function ClientList({ 
  clients = [],
  onViewProfile
}: ClientListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: works = [] } = useQuery<Work[]>({
    queryKey: ["works"],
    queryFn: async () => {
      const { getWorksAction } = await import("@/dashboard/work/actions/work-actions");
      return getWorksAction();
    },
    refetchInterval: 10000,
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      const { getPaymentsAction } = await import("@/dashboard/payments/actions/payment-actions");
      return getPaymentsAction();
    },
    refetchInterval: 10000,
  });

  // Deduplicate
  const uniqueClients = clients.filter(
    (c, i, self) => i === self.findIndex((x) => x.id === c.id)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteClientAction(id);
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert("Failed to delete client.");
    } finally {
      setDeletingId(null);
    }
  };

  // Per-client task counts using rolling billing logic
  const getTaskCounts = (clientName: string) => {
    const cWorks = (works as Work[]).filter((w: Work) => w.client === clientName);
    
    // Calculate taskStartDate dynamically based on paid/unpaid invoice history
    const clientPayments = (payments as Payment[]).filter(p => p.client === clientName);
    const unpaidPayments = clientPayments.filter(p => p.payment_status === "Pending" || p.payment_status === "Overdue");
    
    const now = new Date();
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

    // Filter completed tasks completed after taskStartDate
    const completedTasks = cWorks.filter((w: Work) => {
      if ((w.status as string) !== "Completed" && w.status !== "Done") return false;
      const dateStr = w.completedAt || w.updatedAt || w.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d > taskStartDate;
    });

    return {
      done: completedTasks.length,
      active: cWorks.filter((w: Work) => ["To Do", "In Progress", "Review"].includes(w.status)).length,
      total: cWorks.length,
    };
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Count pill */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Showing {uniqueClients.length} client{uniqueClients.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table List Layout */}
      {uniqueClients.length === 0 ? (
        <div className="bg-white dark:bg-slate-950/60 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 py-24 text-center">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-650 uppercase tracking-widest">
            No clients match your filters
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950/60 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-6 px-8 py-4 bg-slate-50/80 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60 select-none">
            {["Client", "Contact", "Plan", "Tasks", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {uniqueClients.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                statusConfig={statusConfig}
                tasks={getTaskCounts(client.name)}
                deletingId={deletingId}
                onViewProfile={onViewProfile}
                onDeleteClick={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
