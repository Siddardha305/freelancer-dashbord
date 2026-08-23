'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Search, LayoutGrid, List as ListIcon, Plus, Filter, Calendar, History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkFilterTabsProps {
  view: "board" | "list" | "calendar" | "history";
  setView: (v: "board" | "list" | "calendar" | "history") => void;
  timeframeFilter: 'this_month' | 'last_month' | 'this_year' | 'all_time';
  setTimeframeFilter: (t: 'this_month' | 'last_month' | 'this_year' | 'all_time') => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onAddTaskClick: () => void;
  isEditor?: boolean;
}

export function WorkFilterTabs({
  view,
  setView,
  timeframeFilter,
  setTimeframeFilter,
  searchTerm,
  setSearchTerm,
  onAddTaskClick,
  isEditor = false
}: WorkFilterTabsProps) {
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close timeframe dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeframeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeframeLabels = {
    this_month: 'THIS MONTH',
    last_month: 'LAST MONTH',
    this_year: 'THIS YEAR',
    all_time: 'ALL TIME'
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pt-4">
      <div className="flex items-center gap-6">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button 
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'board' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
          <button 
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'list' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button 
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'calendar' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button 
            onClick={() => setView("history")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'history' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>
 
        <div ref={dropdownRef} className="relative hidden md:flex items-center text-slate-400 pl-2">
          <button
            onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest hover:text-slate-900 transition-colors focus:outline-none"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500 font-extrabold">{timeframeLabels[timeframeFilter]}</span>
            <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", isTimeframeOpen && "transform rotate-180")} />
          </button>

          {isTimeframeOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <ul className="py-1">
                {(Object.keys(timeframeLabels) as Array<keyof typeof timeframeLabels>).map((key) => {
                  const isSelected = timeframeFilter === key;
                  return (
                    <li key={key}>
                      <button
                        onClick={() => {
                          setTimeframeFilter(key);
                          setIsTimeframeOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider transition-colors",
                          isSelected 
                            ? "bg-indigo-600 text-white" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                        )}
                      >
                        {timeframeLabels[key]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
 
      <div className="flex items-center gap-4 w-full xl:w-auto">
        <div className="relative flex-1 xl:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client or task title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-card border border-card-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 shadow-sm"
          />
        </div>
        {!isEditor && (
          <button 
            onClick={onAddTaskClick}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/40 hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
