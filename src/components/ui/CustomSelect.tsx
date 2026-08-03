'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
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
  isSearchable?: boolean;
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
  disabled = false,
  isSearchable = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSearchable) return;
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleContainerClick = () => {
    if (disabled) return;
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // When open and searching, value is searchQuery. Otherwise, it is selectedOption label.
  const displayValue = isOpen ? searchQuery : (selectedOption ? selectedOption.label : "");

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
      <div 
        onClick={handleContainerClick}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 font-bold focus-within:ring-4 focus-within:ring-indigo-650/10 focus-within:border-indigo-650 transition-all text-left relative cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isOpen && "ring-4 ring-indigo-650/10 border-indigo-600"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          readOnly={!isSearchable || disabled}
          disabled={disabled}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          className={cn(
            "w-full bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 font-bold placeholder-slate-450 dark:placeholder-slate-500 placeholder:font-bold pr-4 cursor-pointer text-sm",
            !isSearchable && "cursor-pointer"
          )}
        />
        
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-slate-400 dark:text-slate-550 transition-transform duration-200 cursor-pointer shrink-0", 
            isOpen && "transform rotate-180"
          )} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-[1.8rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto py-2 divide-y divide-slate-50 dark:divide-slate-900/50 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full px-6 py-3.5 text-xs text-left text-slate-700 dark:text-slate-355 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-650 dark:hover:text-indigo-400 flex items-center justify-between transition-colors cursor-pointer",
                        isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-455" />}
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
