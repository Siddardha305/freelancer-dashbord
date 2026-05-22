'use client';

import React from 'react';
import { Mail, Phone, Globe, Trash2, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { ClientAvatar } from './ClientAvatar';
import { ClientIdentity } from './ClientIdentity';
import { ClientContactInfo } from './ClientContactInfo';

interface ClientRowProps {
  client: any;
  statusConfig: Record<string, { label: string; dot: string; row: string; badge: string }>;
  tasks: { done: number; active: number };
  deletingId: string | null;
  onViewProfile?: (client: any) => void;
  onDeleteClick: (clientId: string) => void;
}

export function ClientRow({
  client,
  statusConfig,
  tasks,
  deletingId,
  onViewProfile,
  onDeleteClick,
}: ClientRowProps) {
  const { formatCurrency } = useCurrency();
  const sc = statusConfig[client.status] ?? statusConfig["Inactive"];

  return (
    <div
      className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-x-6 px-8 py-5 items-center transition-colors duration-150 group ${sc.row}`}
    >
      {/* Client Identity Block */}
      <div className="flex items-center gap-4 min-w-0">
        <ClientAvatar 
          name={client.name} 
          className="h-11 w-11 text-base group-hover:bg-indigo-600 group-hover:border-indigo-600" 
        />
        <ClientIdentity 
          name={client.name} 
          niche={client.niche} 
          priority={client.priority} 
          className="group-hover:text-indigo-700 transition-colors"
        />
      </div>

      {/* Contact Info Block */}
      <ClientContactInfo 
        email={client.email} 
        phone={client.phone} 
        country={client.country} 
        variant="list" 
      />

      {/* Pricing / Plan details */}
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

      {/* Live Tasks Counts */}
      <div className="flex items-center gap-3 select-none">
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

      {/* Hover action menu buttons */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link
          href={`/dashboard/clients/${client.id}`}
          onClick={(e) => {
            if (onViewProfile) {
              e.preventDefault();
              onViewProfile(client);
            }
          }}
          className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
          title="View Profile"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDeleteClick(client.id)}
          disabled={deletingId === client.id}
          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
