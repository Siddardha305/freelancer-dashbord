'use client';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deleteClientAction } from "@/dashboard/clients/actions/client-actions";
import { ClientRow } from "./ClientRow";

const statusConfig: Record<string, { label: string; dot: string; row: string; badge: string }> = {
  Active: {
    label: "Active",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-50/30",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  "On Hold": {
    label: "On Hold",
    dot: "bg-amber-500",
    row: "hover:bg-amber-50/30",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Inactive: {
    label: "Inactive",
    dot: "bg-slate-300",
    row: "hover:bg-slate-50/50",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
  },
  Completed: {
    label: "Completed",
    dot: "bg-indigo-500",
    row: "hover:bg-indigo-50/30",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
};

interface ClientListProps {
  clients?: any[];
  onViewProfile?: (client: any) => void;
}

export function ClientList({ 
  clients = [],
  onViewProfile
}: ClientListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: works = [] } = useQuery({
    queryKey: ["works"],
    queryFn: async () => {
      const { getWorksAction } = await import("@/dashboard/work/actions/work-actions");
      return getWorksAction();
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
      alert("Failed to delete client.");
    } finally {
      setDeletingId(null);
    }
  };

  // Per-client task counts
  const getTaskCounts = (clientName: string) => {
    const cWorks = (works as any[]).filter((w: any) => w.client === clientName);
    return {
      done: cWorks.filter((w: any) => w.status === "Completed" || w.status === "Done").length,
      active: cWorks.filter((w: any) => ["To Do", "In Progress", "Review"].includes(w.status)).length,
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
        <div className="bg-white rounded-[2.5rem] border border-slate-200 py-24 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            No clients match your filters
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-6 px-8 py-4 bg-slate-50/80 border-b border-slate-100 select-none">
            {["Client", "Contact", "Plan", "Tasks", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
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
