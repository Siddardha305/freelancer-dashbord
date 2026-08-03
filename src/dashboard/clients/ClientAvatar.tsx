'use client';

import React from 'react';

interface ClientAvatarProps {
  name: string;
  className?: string;
}

export function ClientAvatar({ name, className = '' }: ClientAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 text-xl font-black border border-slate-100 shadow-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0 select-none ${className}`}
    >
      {initial}
    </div>
  );
}
