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
  const initials = author.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className={`bg-slate-900/40 backdrop-blur-md rounded-[2.2rem] border border-slate-800/60 p-8 flex flex-col justify-between hover:border-indigo-500/30 hover:bg-slate-905/60 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 shadow-md group relative overflow-hidden ${className}`}>
      {/* Subtle hover gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Sparkles key={i} className="h-3 w-3 fill-amber-400/20 text-amber-400" />
          ))}
        </div>
        <p className="text-slate-350 text-xs sm:text-[13px] leading-relaxed font-semibold italic">
          &ldquo;{text}&rdquo;
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center font-black text-[10px] text-indigo-300 shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1">
              {author}
              <svg className="h-3.5 w-3.5 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {role}
            </p>
          </div>
        </div>
        <span className="text-[8px] font-extrabold text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
          {tag}
        </span>
      </div>
    </div>
  );
}
