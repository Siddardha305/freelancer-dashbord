'use client';

import React from 'react';

interface ClientDeliveryLimitProps {
  count: number;
}

export function ClientDeliveryLimit({ count }: ClientDeliveryLimitProps) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
      {count || 0} Delivery / mo
    </p>
  );
}
