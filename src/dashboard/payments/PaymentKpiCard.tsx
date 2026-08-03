'use client';

import React from 'react';

interface PaymentKpiCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }> | string;
  badgeText: string;
  badgeColorClass: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  badgeIconAnimationClass?: string;
}

export function PaymentKpiCard({
  title,
  value,
  icon,
  badgeText,
  badgeColorClass,
  badgeIcon: BadgeIcon,
  iconColorClass = 'text-slate-400',
  badgeIconAnimationClass = '',
}: PaymentKpiCardProps) {
  const isStringIcon = typeof icon === 'string';
  const IconComponent = !isStringIcon ? (icon as React.ComponentType<{ className?: string }>) : null;

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 select-none ${iconColorClass}`}>
        {isStringIcon ? (
          <span className="text-8xl font-black tracking-tighter block leading-none mr-2 mt-2">{icon}</span>
        ) : (
          IconComponent && <IconComponent className="w-24 h-24" />
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter">{value}</p>
      <div className={`mt-6 flex items-center text-[10px] font-bold gap-1 uppercase tracking-widest w-fit px-3 py-1 rounded-full border select-none ${badgeColorClass}`}>
        {BadgeIcon && <BadgeIcon className={`w-3 h-3 ${badgeIconAnimationClass}`} />}
        <span>{badgeText}</span>
      </div>
    </div>
  );
}
