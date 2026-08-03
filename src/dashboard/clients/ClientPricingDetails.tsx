'use client';

import React from 'react';
import { ClientStatusDropdown } from './ClientStatusDropdown';
import { ClientDeliveryLimit } from './ClientDeliveryLimit';
import { ClientPriceRate } from './ClientPriceRate';
import { ClientPricingModelTag } from './ClientPricingModelTag';

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
  const isPerThumbnail = pricingModel === 'per_thumbnail';

  return (
    <div className={`flex items-center justify-between pt-6 border-t border-slate-100 mt-auto ${className}`}>
      <div>
        <ClientDeliveryLimit count={thumbnailsPerMonth} />
        <ClientPriceRate 
          price={isPerThumbnail ? (pricePerThumbnail || 400) : (monthlyPrice || 0)} 
          isPerThumbnail={isPerThumbnail} 
        />
      </div>
      <div className="flex flex-col items-end gap-1">
        <ClientStatusDropdown 
          clientId={clientId} 
          currentStatus={status} 
          onStatusChange={onStatusChange} 
        />
        <ClientPricingModelTag isPerThumbnail={isPerThumbnail} />
      </div>
    </div>
  );
}
