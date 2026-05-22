'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { ClientStatusDropdown } from './ClientStatusDropdown';

interface ClientPricingDetailsProps {
  clientId: string;
  status: string;
  monthlyPrice: number;
  thumbnailsPerMonth: number;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export function ClientPricingDetails({
  clientId,
  status,
  monthlyPrice,
  thumbnailsPerMonth,
  onStatusChange,
  className = '',
}: ClientPricingDetailsProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className={`flex items-center justify-between pt-6 border-t border-slate-100 mt-auto ${className}`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {thumbnailsPerMonth} Delivery / mo
        </p>
        <p className="text-xl font-black text-slate-900 tracking-tighter">
          {formatCurrency(monthlyPrice || 0)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <ClientStatusDropdown 
          clientId={clientId} 
          currentStatus={status} 
          onStatusChange={onStatusChange} 
        />
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Retainer</p>
      </div>
    </div>
  );
}
