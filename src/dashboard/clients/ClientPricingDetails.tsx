'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { ClientStatusDropdown } from './ClientStatusDropdown';

interface ClientPricingDetailsProps {
  clientId: string;
  status: string;
  monthlyPrice: number;
  thumbnailsPerMonth: number;
  pricingModel?: string;
  pricePerThumbnail?: number;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export function ClientPricingDetails({
  clientId,
  status,
  monthlyPrice,
  thumbnailsPerMonth,
  pricingModel = 'monthly',
  pricePerThumbnail = 0,
  onStatusChange,
  className = '',
}: ClientPricingDetailsProps) {
  const { formatCurrency } = useCurrency();
  const isPerThumbnail = pricingModel === 'per_thumbnail';

  return (
    <div className={`flex items-center justify-between pt-6 border-t border-slate-100 mt-auto ${className}`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {thumbnailsPerMonth || 0} Delivery / mo
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            {isPerThumbnail ? formatCurrency(pricePerThumbnail || 400) : formatCurrency(monthlyPrice || 0)}
          </span>
          {isPerThumbnail && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
              / Delivery
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <ClientStatusDropdown 
          clientId={clientId} 
          currentStatus={status} 
          onStatusChange={onStatusChange} 
        />
        <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isPerThumbnail ? 'text-indigo-500' : 'text-slate-300'}`}>
          {isPerThumbnail ? 'Per Delivery' : 'Retainer'}
        </p>
      </div>
    </div>
  );
}
