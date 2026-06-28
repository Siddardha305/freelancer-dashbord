'use client'

import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO } from 'date-fns';

interface CustomDatePickerProps {
  value: string; // Expected format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  className = "",
  name,
  required = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialize currentMonth based on active value
  useEffect(() => {
    if (value) {
      try {
        const parsed = parseISO(value);
        if (!isNaN(parsed.getTime())) {
          setCurrentMonth(parsed);
        }
      } catch (e) {
        console.error("Invalid initial date in CustomDatePicker:", e);
      }
    }
  }, [value]);

  // Click outside listener to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDaySelect = (day: Date, e: React.MouseEvent) => {
    e.preventDefault();
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(format(new Date(), 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange('');
    setIsOpen(false);
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.

  // Create padding slots for layout offset at start of month
  const paddingSlots = Array.from({ length: startDayOfWeek });

  const formattedValue = value 
    ? format(parseISO(value), 'PPP') 
    : '';

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* Visual Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-left text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-650/10 focus:border-indigo-650 transition-all cursor-pointer ${className}`}
      >
        <span className={value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 font-medium"}>
          {formattedValue || placeholder}
        </span>
        <CalendarDays className="h-4.5 w-4.5 text-slate-400 dark:text-slate-550 shrink-0" />
      </button>

      {/* Hidden input to ensure standard HTML form serialization (FormData) works */}
      <input 
        type="hidden" 
        name={name} 
        value={value} 
        required={required} 
      />

      {/* Calendar Popup Dropdown Card */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-[150] w-[320px] p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Pad offset days */}
            {paddingSlots.map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {/* Render actual days */}
            {days.map((day) => {
              const isSelected = value ? isSameDay(day, parseISO(value)) : false;
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={(e) => handleDaySelect(day, e)}
                  className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none"
                      : isToday
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/10"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={handleClear}
              className="text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-widest cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest cursor-pointer"
            >
              Today
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
