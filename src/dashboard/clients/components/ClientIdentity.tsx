'use client';

import React from 'react';

const priorityColor: Record<string, string> = {
  High: "text-red-600 bg-red-50 border-red-100",
  Medium: "text-amber-600 bg-amber-50 border-amber-100",
  Low: "text-emerald-600 bg-emerald-50 border-emerald-100",
};

interface ClientIdentityProps {
  name: string;
  niche?: string;
  priority?: string;
  className?: string;
}

export function ClientIdentity({ name, niche = 'General', priority, className = '' }: ClientIdentityProps) {
  const pc = priority ? (priorityColor[priority] ?? priorityColor["Medium"]) : '';

  return (
    <div className={`min-w-0 ${className}`}>
      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
        {name}
      </h3>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {niche}
        </p>
        {priority && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${pc}`}>
            {priority}
          </span>
        )}
      </div>
    </div>
  );
}
