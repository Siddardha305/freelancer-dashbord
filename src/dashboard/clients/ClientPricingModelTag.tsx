'use client';

import React from 'react';

interface ClientPricingModelTagProps {
  isPerThumbnail: boolean;
}

export function ClientPricingModelTag({ isPerThumbnail }: ClientPricingModelTagProps) {
  return (
    <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isPerThumbnail ? 'text-indigo-500' : 'text-slate-300'}`}>
      {isPerThumbnail ? 'Per Delivery' : 'Retainer'}
    </p>
  );
}
