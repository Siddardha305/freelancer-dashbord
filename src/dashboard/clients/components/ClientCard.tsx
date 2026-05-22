'use client';

import React from 'react';
import { ClientAvatar } from './ClientAvatar';
import { ClientIdentity } from './ClientIdentity';
import { ClientActionsDropdown } from './ClientActionsDropdown';
import { ClientChannelButton } from './ClientChannelButton';
import { ClientContactInfo } from './ClientContactInfo';
import { ClientPricingDetails } from './ClientPricingDetails';

interface ClientCardProps {
  client: any;
  onViewProfile?: (client: any) => void;
  onEditClick: (client: any) => void;
  onDeleteClick: (clientId: string) => void;
  onStatusChange?: (newStatus: string) => void;
  className?: string;
}

export function ClientCard({
  client,
  onViewProfile,
  onEditClick,
  onDeleteClick,
  onStatusChange,
  className = '',
}: ClientCardProps) {
  const handleCardHeaderClick = () => {
    if (onViewProfile) {
      onViewProfile(client);
    } else {
      window.location.href = `/dashboard/clients/${client.id}`;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-200 hover:shadow-xl transition-all duration-500 group relative animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
      <div className="p-8 flex flex-col flex-1 justify-between h-full">
        <div>
          {/* Header Info */}
          <div className="flex justify-between items-start mb-6">
            <div 
              onClick={handleCardHeaderClick}
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all duration-200 min-w-0 flex-1"
            >
              <ClientAvatar name={client.name} />
              <ClientIdentity name={client.name} niche={client.niche} />
            </div>
            
            <ClientActionsDropdown 
              client={client}
              onViewProfile={onViewProfile}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              className="shrink-0 ml-2"
            />
          </div>
          
          {/* Main Details */}
          <div className="space-y-4 mb-8">
            <ClientChannelButton channelLink={client.channel_link} />
            <ClientContactInfo email={client.email} variant="card" />
          </div>
        </div>

        {/* Pricing / Status Footer */}
        <ClientPricingDetails 
          clientId={client.id}
          status={client.status || 'Active'}
          monthlyPrice={client.monthly_price || 0}
          thumbnailsPerMonth={client.thumbnails_per_month || 0}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
