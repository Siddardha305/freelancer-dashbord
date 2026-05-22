'use client'

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Zap } from 'lucide-react';
import { ClientTable } from '@/dashboard/clients/components/ClientTable';
import { ClientList } from '@/dashboard/clients/components/ClientList';
import { AddClientModal } from '@/dashboard/clients/components/AddClientModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { ClientFilterControls } from '@/dashboard/clients/components/ClientFilterControls';
import { ClientProfileDrawer } from '@/dashboard/clients/components/ClientProfileDrawer';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [drawerClient, setDrawerClient] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-desc' | 'price-asc'
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const openDrawer = (client: any) => {
    setDrawerClient(client);
    setTimeout(() => setIsDrawerOpen(true), 50);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setDrawerClient(null), 500);
  };

  // Real-time clients fetching
  const { data: clients = [], isLoading: loading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClientsAction,
    refetchInterval: 8000,
  });

  const refreshData = async (_newClient?: any) => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  // Filter and Sort logic
  const filteredClients = clients
    .filter((client: any) => {
      // 1. Search Query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        client.name.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.niche && client.niche.toLowerCase().includes(searchLower)) ||
        client.id.toLowerCase().includes(searchLower);

      // 2. Status Filter
      const matchesStatus = statusFilter === 'All' || client.status === statusFilter;

      // 3. Priority Filter
      const matchesPriority = priorityFilter === 'All' || client.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-desc':
          return (b.monthly_price || 0) - (a.monthly_price || 0);
        case 'price-asc':
          return (a.monthly_price || 0) - (b.monthly_price || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin shadow-sm"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Loading Clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <PageHeader
        title="Clients"
        description="Manage your client base and projects"
        action={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
          >
            <Plus className="h-4 w-4" />
            Add New Client
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
          
          {/* Reusable Client Filter & Sort Controls */}
          <ClientFilterControls 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isFilterPanelOpen={isFilterPanelOpen}
            setIsFilterPanelOpen={setIsFilterPanelOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Client Content Display */}
          {clients.length > 0 && filteredClients.length > 0 && (
            <div className="transition-all duration-500">
              {viewMode === 'grid' ? (
                <ClientTable clients={filteredClients} onUpdate={refreshData} onViewProfile={openDrawer} />
              ) : (
                <ClientList clients={filteredClients} onViewProfile={openDrawer} />
              )}
            </div>
          )}

          {/* Empty State: No Matches Found */}
          {clients.length > 0 && filteredClients.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200/80 flex flex-col items-center justify-center animate-in fade-in duration-300 shadow-sm">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100/50">
                <Search className="h-6 w-6 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">No matches found</h3>
              <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto mb-6 uppercase tracking-widest leading-relaxed">We couldn't find any clients matching your active filters or search terms.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setSortBy('newest');
                }}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest border border-indigo-100 px-6 py-3 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95"
              >
                Clear Search & Filters
              </button>
            </div>
          )}

          {/* Empty State: Onboarding */}
          {clients.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200/80 flex flex-col items-center justify-center shadow-sm">
              <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                <Zap className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">No Clients Found</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mb-10 leading-relaxed uppercase tracking-widest">Get started by integrating your first client into the platform.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-3 bg-indigo-600 px-8 py-4 rounded-2xl text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </button>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <AddClientModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={refreshData}
        />
      )}

      {/* Reusable slide-over Client Profile Drawer Component */}
      <ClientProfileDrawer 
        isOpen={isDrawerOpen}
        client={drawerClient}
        onClose={closeDrawer}
        onSuccess={(updatedClient) => {
          if (updatedClient === null) {
            refreshData();
          } else {
            setDrawerClient(updatedClient);
            refreshData();
          }
        }}
      />
    </div>
  );
}



