'use client'

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Mail,
  Phone,
  Globe,
  Trash2,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  PauseCircle,
  ArrowUpRight,
} from "lucide-react";
import { deleteClientAction } from "@/dashboard/clients/actions/client-actions";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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

const priorityColor: Record<string, string> = {
  High: "text-red-600 bg-red-50 border-red-100",
  Medium: "text-amber-600 bg-amber-50 border-amber-100",
  Low: "text-emerald-600 bg-emerald-50 border-emerald-100",
};

export function ClientList({ clients = [] }: { clients?: any[] }) {
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  const filtered = uniqueClients.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteClientAction(id);
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
    <div className="space-y-5 mt-6">
      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, niche or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {["All", "Active", "On Hold", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider border transition-all duration-200 ${
                statusFilter === s
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Count pill ── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
          {statusFilter !== "All" ? ` · ${statusFilter}` : ""}
        </span>
        {searchTerm && (
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
            matching "{searchTerm}"
          </span>
        )}
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 py-24 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {uniqueClients.length === 0
              ? "No clients yet — add your first client above"
              : "No clients match your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-6 px-8 py-4 bg-slate-50/80 border-b border-slate-100">
            {["Client", "Contact", "Plan", "Tasks", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {filtered.map((client) => {
              const sc = statusConfig[client.status] ?? statusConfig["Inactive"];
              const pc = priorityColor[client.priority] ?? priorityColor["Medium"];
              const tasks = getTaskCounts(client.name);

              return (
                <div
                  key={client.id}
                  className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-6 px-8 py-5 items-center transition-colors duration-150 group ${sc.row}`}
                >
                  {/* Client identity */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                      <span className="text-base font-black text-indigo-600 group-hover:text-white transition-colors uppercase">
                        {client.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                        {client.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {client.niche || "General"}
                        </span>
                        {client.priority && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${pc}`}>
                            {client.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1 min-w-0">
                    {client.email && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
                        <Mail className="h-3 w-3 text-slate-300 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Phone className="h-3 w-3 text-slate-300 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    ) : client.country ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Globe className="h-3 w-3 text-slate-300 shrink-0" />
                        <span>{client.country}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Plan / Rate */}
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency(client.monthly_price || 0)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {client.pricing_model === "per_thumbnail" ? "Per delivery" : "Per month"}
                    </p>
                    {client.thumbnails_per_month > 0 && (
                      <p className="text-[9px] font-bold text-indigo-400 mt-0.5">
                        {client.thumbnails_per_month} / mo
                      </p>
                    )}
                  </div>

                  {/* Live task counts */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-emerald-600" title="Completed">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-black">{tasks.done}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500" title="Active / Pending">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs font-black">{tasks.active}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${sc.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                      title="View Profile"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
