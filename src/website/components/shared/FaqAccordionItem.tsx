'use client'

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle
}: FaqAccordionItemProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg shadow-slate-950/20">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-900/60 transition-colors group cursor-pointer"
      >
        <span className="text-sm font-bold text-slate-100 pr-4 transition-colors group-hover:text-indigo-400">
          {question}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`} 
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-60 border-t border-slate-850' : 'max-h-0'
        }`}
      >
        <p className="p-6 text-xs sm:text-sm text-slate-400 font-medium leading-relaxed bg-slate-950/40">
          {answer}
        </p>
      </div>
    </div>
  );
}
