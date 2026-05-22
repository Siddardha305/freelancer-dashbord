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
    <div className={`bg-white rounded-[2rem] border border-slate-200/80 p-8 flex flex-col justify-between hover:border-slate-350 hover:shadow-xl transition-all shadow-sm group ${className}`}>
      <div className="space-y-4">
        <div className="flex gap-1 text-indigo-600">
          {[...Array(5)].map((_, i) => (
            <Sparkles key={i} className="h-3.5 w-3.5 fill-indigo-600/10 text-indigo-600" />
          ))}
        </div>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
          &ldquo;{text}&rdquo;
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
            {author}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {role}
          </p>
        </div>
        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-md uppercase tracking-wider">
          {tag}
        </span>
      </div>
    </div>
  );
}
