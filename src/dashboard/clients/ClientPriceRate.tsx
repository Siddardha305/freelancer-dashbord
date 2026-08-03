'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface ClientPriceRateProps {
  price: number;
  isPerThumbnail: boolean;
}

export function ClientPriceRate({ price, isPerThumbnail }: ClientPriceRateProps) {
  const { formatCurrency } = useCurrency();
  
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-black text-slate-900 tracking-tighter">
        {formatCurrency(price || 0)}
      </span>
      {isPerThumbnail && (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
          / Delivery
        </span>
      )}
    </div>
  );
}
