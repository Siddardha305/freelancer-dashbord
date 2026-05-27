'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title?: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  centered = true,
  className = ''
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? 'text-center max-w-2xl mx-auto' : 'text-left'} mb-16 sm:mb-20 ${className}`}>
      {/* Dynamic Status Pill */}
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4 ${centered ? 'mx-auto' : ''}`}>
        {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 text-indigo-400" />} 
        {badge}
      </div>

      {title && (
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {title}
        </h2>
      )}

      {description && (
        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-3 max-w-lg mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
