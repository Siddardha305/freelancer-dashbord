'use client'

import React from 'react';
import Image from 'next/image';
import { Terminal } from 'lucide-react';

interface ConsoleWindowProps {
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  aspectRatio?: '16/10' | 'video' | 'auto';
  isTerminal?: boolean;
  className?: string;
}

export default function ConsoleWindow({
  title,
  imageSrc,
  imageAlt = 'Console Screen mockup',
  children,
  aspectRatio = '16/10',
  isTerminal = false,
  className = ''
}: ConsoleWindowProps) {
  const aspectClass = {
    '16/10': 'aspect-[16/10]',
    'video': 'aspect-video',
    'auto': 'h-auto'
  }[aspectRatio];

  return (
    <div className={`w-full rounded-[2rem] bg-slate-900/40 p-3 border border-slate-800/60 shadow-2xl shadow-slate-950/50 relative overflow-hidden group ${className}`}>
      
      {/* Simulated Window Control Bar */}
      <div className={`h-9 border-b border-slate-800/60 px-4 flex items-center justify-between rounded-t-2xl ${isTerminal ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40'}`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isTerminal ? 'bg-rose-500/80' : 'bg-slate-800'}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${isTerminal ? 'bg-amber-500/80' : 'bg-slate-800'}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${isTerminal ? 'bg-emerald-500/80' : 'bg-slate-800'}`} />
        </div>
        
        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isTerminal ? 'text-slate-500' : 'text-slate-500'}`}>
          {isTerminal && <Terminal className="h-3 w-3 text-indigo-500" />}
          {title}
        </span>
        
        <div className="w-12 h-3" />
      </div>

      {/* Screen area */}
      <div className={`relative w-full rounded-b-[1.3rem] overflow-hidden border-t border-slate-800/60 ${aspectClass} ${isTerminal ? 'bg-slate-950 border-slate-800' : 'bg-slate-950'}`}>
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            fill 
            className="object-cover object-top hover:scale-[1.005] transition-transform duration-700"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
