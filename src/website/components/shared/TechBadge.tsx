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
    slate: 'bg-slate-100 border-slate-200/80 text-slate-650',
    indigo: 'bg-indigo-50 border-indigo-100/60 text-indigo-650',
    emerald: 'bg-emerald-50 border-emerald-100/60 text-emerald-650'
  }[variant];

  const iconColorStyles = {
    slate: 'text-indigo-600',
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600'
  }[variant];

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${variantStyles} ${className}`}>
      {Icon && <Icon className={`h-3.5 w-3.5 ${iconColorStyles}`} />}
      {label}
    </div>
  );
}
