'use client';

import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface ClientChannelButtonProps {
  channelLink?: string;
  className?: string;
}

export function ClientChannelButton({ channelLink, className = '' }: ClientChannelButtonProps) {
  if (channelLink) {
    return (
      <a 
        href={channelLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 group/link transition-all hover:bg-indigo-600 hover:border-indigo-600 shadow-sm shadow-indigo-100/50 ${className}`}
      >
        <Play className="h-5 w-5 text-indigo-500 group-hover/link:text-white transition-colors shrink-0" />
        <span className="text-xs font-bold text-indigo-600 flex-1 truncate group-hover/link:text-white transition-colors uppercase tracking-widest text-left">
          Visit YouTube Channel
        </span>
        <ExternalLink className="h-4 w-4 text-indigo-300 group-hover/link:text-white transition-colors shrink-0" />
      </a>
    );
  }

  return (
    <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        No Link Provided
      </span>
    </div>
  );
}
