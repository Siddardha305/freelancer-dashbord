'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { updateClientAction } from '@/dashboard/clients/actions/client-actions';

interface ClientStatusDropdownProps {
  clientId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

const statusThemes: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80 hover:border-emerald-300/80 focus:ring-emerald-500/20',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/80 hover:border-amber-300/80 focus:ring-amber-500/20',
  Inactive: 'bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100/80 hover:border-red-300/80 focus:ring-red-500/20',
  Completed: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/80 hover:border-indigo-300/80 focus:ring-indigo-500/20',
};

const statusDotColors: Record<string, string> = {
  Active: 'bg-emerald-500',
  'On Hold': 'bg-amber-500',
  Inactive: 'bg-red-500',
  Completed: 'bg-indigo-500',
};

const defaultTheme = 'bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100 focus:ring-slate-500/20';

export function ClientStatusDropdown({
  clientId,
  currentStatus,
  onStatusChange,
  className = '',
}: ClientStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themeClass = statusThemes[currentStatus] ?? defaultTheme;
  const arrowColorClass = 
    currentStatus === 'Active' ? 'text-emerald-600' :
    currentStatus === 'On Hold' ? 'text-amber-600' :
    currentStatus === 'Inactive' ? 'text-red-600' :
    currentStatus === 'Completed' ? 'text-indigo-600' :
    'text-slate-500';

  const handleStatusSelect = async (status: string) => {
    setIsOpen(false);
    if (status === currentStatus) return;

    try {
      const result = await updateClientAction(clientId, { status });
      if (result.message !== 'success') throw new Error(result.message);
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (error) {
      console.error("Failed to update client status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center rounded-full pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-widest border cursor-pointer focus:outline-none focus:ring-2 transition-all select-none shadow-sm ${themeClass}`}
      >
        {currentStatus || 'Active'}
      </button>
      <div className="absolute right-2.5 pointer-events-none flex items-center justify-center">
        <ChevronDown className={`h-3 w-3 stroke-[3] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${arrowColorClass}`} />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
            {(['Active', 'On Hold', 'Inactive', 'Completed'] as const).map((status) => (
              <button 
                key={status}
                type="button"
                onClick={() => handleStatusSelect(status)}
                className={`w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  status === 'Active' ? 'text-emerald-700 hover:bg-emerald-50/50' :
                  status === 'On Hold' ? 'text-amber-700 hover:bg-amber-50/50' :
                  status === 'Inactive' ? 'text-red-700 hover:bg-red-50/50' :
                  'text-indigo-700 hover:bg-indigo-50/50'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[status]} ${status === currentStatus ? 'animate-pulse scale-125' : ''}`} />
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
