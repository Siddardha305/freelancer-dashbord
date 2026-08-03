'use client'

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Zap, Lock, ArrowRight } from 'lucide-react';
import { ClientTable } from '@/dashboard/clients/ClientTable';
import { ClientList } from '@/dashboard/clients/ClientList';
import { AddClientModal } from '@/dashboard/clients/AddClientModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { getClientsAction } from '@/dashboard/clients/client-actions';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';
import { ClientFilterControls } from '@/dashboard/clients/ClientFilterControls';
import { ClientProfileDrawer } from '@/dashboard/clients/ClientProfileDrawer';
import { Client } from '@/types/client';
import { usePlan } from '@/context/PlanContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { planName, limits, canAddClient } = usePlan();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Persist View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('clients_viewMode') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        if (user?.teamRole === 'editor' || user?.workspaceType === 'corporate') {
          router.replace('/dashboard/work');
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load user on clients page:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [drawerClient, setDrawerClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search & Filter State with LocalStorage Persistence
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clients_searchQuery') || '';
    }
    return '';
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clients_statusFilter') || 'All';
    }
    return 'All';
  });
  const [priorityFilter, setPriorityFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clients_priorityFilter') || 'All';
    }
    return 'All';
  });
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clients_sortBy') || 'newest';
    }
    return 'newest';
  });
  
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Synchronization Effects
  useEffect(() => {
    localStorage.setItem('clients_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('clients_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('clients_statusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('clients_priorityFilter', priorityFilter);
  }, [priorityFilter]);

  useEffect(() => {
    localStorage.setItem('clients_sortBy', sortBy);
  }, [sortBy]);

  const openDrawer = (client: Client) => {
    setDrawerClient(client);
    setTimeout(() => setIsDrawerOpen(true), 50);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setDrawerClient(null), 500);
  };

  // Real-time clients fetching
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClientsAction,
    refetchInterval: 8000,
  });

  const loading = isLoadingClients || loadingUser;

  const totalClients = (clients as Client[]).length;
  const atClientLimit = !canAddClient(totalClients);
  const clientLimitText = limits.maxClients === Infinity ? 'Unlimited' : String(limits.maxClients);

  const refreshData = async () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  // Filter and Sort logic
  const filteredClients = (clients as Client[])
    .filter((client: Client) => {
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
    .sort((a: Client, b: Client) => {
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
          atClientLimit ? (
            <Link
              href="/pricing"
              className="flex items-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold cursor-pointer hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all duration-200 group"
              title={`${planName} plan limit: ${clientLimitText} clients`}
            >
              <Lock className="h-4 w-4 group-hover:text-amber-600" />
              Upgrade to Add More
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
            >
              <Plus className="h-4 w-4" />
              Add New Client
            </button>
          )
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">

          {/* Plan limit warning banner */}
          {atClientLimit && (
            <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-800">
                  You&apos;ve reached the <span className="font-black">{planName}</span> plan limit of <span className="font-black">{clientLimitText} clients</span>. Upgrade to add more.
                </p>
              </div>
              <Link href="/pricing" className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-amber-200 transition-all shrink-0">
                View Plans →
              </Link>
            </div>
          )}
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
              <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto mb-6 uppercase tracking-widest leading-relaxed">We couldn&apos;t find any clients matching your active filters or search terms.</p>
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

      <AddClientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={refreshData}
      />

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



