'use client'

import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Zap } from 'lucide-react';
import { ClientTable } from '@/features/clients/components/ClientTable';
import { ClientList } from '@/features/clients/components/ClientList';
import { AddClientModal } from '@/features/clients/components/AddClientModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { getClientsAction } from '@/features/clients/actions/client-actions';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClientsAction();
        setClients(data);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadClients();
    // Enable 5-second live polling for real-time synchronization
    const interval = setInterval(loadClients, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const refreshData = async (newClient?: any) => {
    if (newClient) {
      // Instant update: prepend the new client to the current list
      setClients(prev => [newClient, ...prev]);
    }
    
    // Background refresh to ensure full data consistency
    const data = await getClientsAction();
    setClients(data);
  };

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
        <div className="mx-auto max-w-7xl space-y-10">
          
          {/* Filters & Search */}
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
            <div className="relative w-full xl:w-[500px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by client name or ID..." 
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Filter className="h-4 w-4" />
                Sort & Filter
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

          {/* Client Content */}
          <div className="transition-all duration-500">
            {viewMode === 'grid' ? (
              <ClientTable clients={clients} />
            ) : (
              <ClientList clients={clients} />
            )}
          </div>

          {clients.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
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
    </div>
  );
}



