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
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors group cursor-pointer"
      >
        <span className="text-sm font-bold text-slate-800 pr-4 transition-colors group-hover:text-indigo-600">
          {question}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`} 
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-60 border-t border-slate-100' : 'max-h-0'
        }`}
      >
        <p className="p-6 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed bg-slate-50/30">
          {answer}
        </p>
      </div>
    </div>
  );
}
