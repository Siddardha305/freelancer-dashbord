'use client';

import React, { useState } from 'react';
import { MoreHorizontal, User, Edit3, Trash2 } from 'lucide-react';

import { Client } from '@/types/client';

interface ClientActionsDropdownProps {
  client: Client;
  onViewProfile?: (client: Client) => void;
  onEditClick: (client: Client) => void;
  onDeleteClick: (clientId: string) => void;
  className?: string;
}

export function ClientActionsDropdown({
  client,
  onViewProfile,
  onEditClick,
  onDeleteClick,
  className = '',
}: ClientActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all ${
          isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'
        }`}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => {
                if (onViewProfile) {
                  onViewProfile(client);
                } else {
                  window.location.href = `/dashboard/clients/${client.id}`;
                }
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-3 uppercase tracking-wider transition-colors border-b border-slate-50 pb-2 mb-2"
            >
              <User className="h-3.5 w-3.5" />
              View Profile
            </button>
            <button 
              type="button"
              onClick={() => {
                onEditClick(client);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-wider transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Client
            </button>
            <button 
              type="button"
              onClick={() => {
                onDeleteClick(client.id);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 uppercase tracking-wider transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Client
            </button>
          </div>
        </>
      )}
    </div>
  );
}
