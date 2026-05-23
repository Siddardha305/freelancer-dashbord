'use client'

import React from 'react';
import { Search, Filter, LayoutGrid, List as ListIcon, X } from 'lucide-react';

interface ClientFilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  isFilterPanelOpen: boolean;
  setIsFilterPanelOpen: (isOpen: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export function ClientFilterControls({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  isFilterPanelOpen,
  setIsFilterPanelOpen,
  viewMode,
  setViewMode,
}: ClientFilterControlsProps) {
  const activeFiltersCount = 
    (statusFilter !== 'All' ? 1 : 0) + 
    (priorityFilter !== 'All' ? 1 : 0) + 
    (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Filter Control Bar */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        <div className="relative w-full xl:w-[500px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client name, email, niche or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <button 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-2 px-6 py-3.5 border rounded-2xl text-xs font-bold transition-all shadow-sm ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/80'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Sort & Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[9px] font-black bg-indigo-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Collapsible Filter Panel */}
      {isFilterPanelOpen && (
        <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter By Status</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Active', 'On Hold', 'Inactive', 'Completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status === 'All' ? 'All' : (statusFilter === status ? 'All' : status))}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100/80 hover:text-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter By Priority</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'High', 'Medium', 'Low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority === 'All' ? 'All' : (priorityFilter === priority ? 'All' : priority))}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                      priorityFilter === priority
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100/80 hover:text-slate-700'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'name-asc', label: 'Name (A-Z)' },
                  { value: 'name-desc', label: 'Name (Z-A)' },
                  { value: 'price-desc', label: 'Price (High-Low)' },
                  { value: 'price-asc', label: 'Price (Low-High)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-center border truncate ${
                      sortBy === option.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100/80 hover:text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Trigger */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-end border-t border-slate-100 pt-4 mt-2">
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setSortBy('newest');
                }}
                className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all active:scale-95 animate-in fade-in"
              >
                <X className="h-3.5 w-3.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
