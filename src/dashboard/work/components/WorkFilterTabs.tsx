'use client'

import React from 'react';
import { Search, LayoutGrid, List as ListIcon, Plus, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkFilterTabsProps {
  view: "board" | "list" | "calendar";
  setView: (v: "board" | "list" | "calendar") => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onAddTaskClick: () => void;
}

export function WorkFilterTabs({
  view,
  setView,
  priorityFilter,
  setPriorityFilter,
  searchTerm,
  setSearchTerm,
  onAddTaskClick
}: WorkFilterTabsProps) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pt-4">
      <div className="flex items-center gap-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
          <button 
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
          <button 
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
              view === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
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
        <button 
          onClick={onAddTaskClick}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </div>
  );
}
