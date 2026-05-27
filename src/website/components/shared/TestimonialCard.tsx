'use client'

import React from 'react';
import { Sparkles } from 'lucide-react';

interface TestimonialCardProps {
  text: string;
  author: string;
  role: string;
  tag: string;
  className?: string;
}

export default function TestimonialCard({
  text,
  author,
  role,
  tag,
  className = ''
}: TestimonialCardProps) {
  return (
    <div className={`bg-slate-900/40 rounded-[2rem] border border-slate-800/60 p-8 flex flex-col justify-between hover:border-slate-700/60 hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-slate-950/40 transition-all shadow-md group ${className}`}>
      <div className="space-y-4">
        <div className="flex gap-1 text-indigo-400">
          {[...Array(5)].map((_, i) => (
            <Sparkles key={i} className="h-3.5 w-3.5 fill-indigo-500/10 text-indigo-400" />
          ))}
        </div>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold italic">
          &ldquo;{text}&rdquo;
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-850 flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">
            {author}
          </p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {role}
          </p>
        </div>
        <span className="text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
          {tag}
        </span>
      </div>
    </div>
  );
}
