'use client';

import React from 'react';
import { Mail, Phone, Globe } from 'lucide-react';

interface ClientContactInfoProps {
  email?: string;
  phone?: string;
  country?: string;
  variant?: 'card' | 'list';
  className?: string;
}

export function ClientContactInfo({ email, phone, country, variant = 'card', className = '' }: ClientContactInfoProps) {
  if (variant === 'list') {
    return (
      <div className={`space-y-1 min-w-0 ${className}`}>
        {email && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
            <Mail className="h-3 w-3 text-slate-300 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {phone ? (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Phone className="h-3 w-3 text-slate-300 shrink-0" />
            <span>{phone}</span>
          </div>
        ) : country ? (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Globe className="h-3 w-3 text-slate-300 shrink-0" />
            <span>{country}</span>
          </div>
        ) : null}
      </div>
    );
  }

  // Card Variant
  if (email) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 group/item transition-colors hover:border-slate-200 ${className}`}>
        <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-slate-600 shrink-0" />
        <span className="text-[11px] font-bold text-slate-500 truncate group-hover/item:text-slate-700">
          {email}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed justify-center ${className}`}>
      <Mail className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        No Email Provided
      </span>
    </div>
  );
}
