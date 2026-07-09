'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  required = false,
  name,
  id,
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      {/* Hidden input for HTML form validation/submit */}
      {name && (
        <input
          type="text"
          name={name}
          id={id}
          value={value}
          required={required}
          readOnly
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}

      {/* Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-650/10 focus:border-indigo-650 transition-all text-left relative disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "ring-4 ring-indigo-650/10 border-indigo-600"
        )}
      >
        <span className={cn(!selectedOption && "text-slate-400 dark:text-slate-500 font-medium")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-[1.8rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2 relative">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 absolute left-6" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-905 dark:text-slate-100 focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto py-2 divide-y divide-slate-50 dark:divide-slate-900/50 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full px-6 py-3.5 text-xs text-left text-slate-700 dark:text-slate-350 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between transition-colors",
                        isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-6 py-4 text-xs font-semibold text-slate-450 dark:text-slate-500 text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
