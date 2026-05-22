'use client'

import React from 'react';
import { X } from 'lucide-react';
import { ClientProfileView } from './ClientProfileView';

interface ClientProfileDrawerProps {
  isOpen: boolean;
  client: any | null;
  onClose: () => void;
  onSuccess: (updatedClient: any | null) => void;
}

export function ClientProfileDrawer({
  isOpen,
  client,
  onClose,
  onSuccess,
}: ClientProfileDrawerProps) {
  if (!client) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] transition-opacity duration-500 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Slide-over Drawer Panel */}
      <div 
        className={`relative w-full md:w-[85vw] lg:w-[70vw] max-w-5xl h-full bg-slate-50 dark:bg-slate-950 shadow-2xl border-l border-slate-200/80 flex flex-col z-10 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header close trigger for accessibility */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-[-50px] hidden md:flex items-center justify-center h-10 w-10 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-500 hover:text-indigo-600 shadow-md transition-all active:scale-95 group"
        >
          <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
        </button>

        {/* Scrollable Container with the ClientProfileView */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-slate-50">
          <ClientProfileView 
            initialClient={client} 
            onClose={onClose}
            onSuccess={onSuccess}
            isDrawerMode={true}
          />
        </div>
      </div>
    </div>
  );
}
