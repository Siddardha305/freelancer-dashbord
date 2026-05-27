'use client'

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TechBadgeProps {
  label: string;
  icon?: LucideIcon;
  variant?: 'indigo' | 'slate' | 'emerald';
  className?: string;
}

export default function TechBadge({
  label,
  icon: Icon,
  variant = 'slate',
  className = ''
}: TechBadgeProps) {
  const variantStyles = {
    slate: 'bg-slate-900/60 border-slate-800/80 text-slate-300',
    indigo: 'bg-indigo-950/40 border-indigo-900/40 text-indigo-400',
    emerald: 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400'
  }[variant];

  const iconColorStyles = {
    slate: 'text-indigo-400',
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400'
  }[variant];

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${variantStyles} ${className}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 ${iconColorStyles}`} />}
      {label}
    </div>
  );
}
