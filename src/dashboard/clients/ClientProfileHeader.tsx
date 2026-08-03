'use client'

import React from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  X, 
  MoreHorizontal, 
  Edit2, 
  TrendingUp, 
  Mail, 
  Phone, 
  Globe, 
  Clock 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { Client } from "@/types/client";

interface ClientProfileHeaderProps {
  client: Client;
  isDrawerMode: boolean;
  onClose?: () => void;
  onDeleteClick: () => void;
  onEditClick: () => void;
  priorityColors: Record<string, string>;
}

export function ClientProfileHeader({
  client,
  isDrawerMode,
  onClose,
  onDeleteClick,
  onEditClick,
  priorityColors
}: ClientProfileHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        {isDrawerMode ? (
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Clients
          </button>
        ) : (
          <Link 
            href="/dashboard/clients" 
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Clients
          </Link>
        )}

        <div className="flex items-center gap-3">
          <button 
            onClick={onDeleteClick}
            className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors active:scale-95"
            title="Delete Profile"
          >
            <Trash2 className="h-5 w-5" />
          </button>
           
          {isDrawerMode && onClose && (
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-slate-50 transition-colors active:scale-95 lg:hidden"
              title="Close Profile"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          )}

          <button className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-slate-50 transition-colors active:scale-95 hidden sm:inline-flex">
            <MoreHorizontal className="h-5 w-5 text-slate-400" />
          </button>
          <button 
            onClick={onEditClick}
            className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 animate-in fade-in duration-200"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="glass-bg rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-card-border overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <TrendingUp className="h-48 w-48 text-indigo-600" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start md:items-center relative z-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-[1.5rem] sm:rounded-[2rem] bg-indigo-50 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl group overflow-hidden shrink-0">
            {client.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={client.avatar} alt={client.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-indigo-600">{client.name.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-1 space-y-3 sm:space-y-4 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-full">{client.name}</h1>
              <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>
                {client.status}
              </Badge>
              <span className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${priorityColors[client.priority as keyof typeof priorityColors] || priorityColors.Medium}`}>
                {client.priority} Priority
              </span>
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {client.niche}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{client.email || "No email"}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" /> {client.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" /> {client.country || "Global"}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" /> {client.timezone || "UTC"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
