'use client'

import { useState, useTransition } from "react";
import { MoreHorizontal, Mail, Phone, Trash2, Search, Filter } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { deleteClientAction } from "@/features/clients/actions/client-actions";

export function ClientList({ clients = [] }: { clients?: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const allClients = clients || [];
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      startTransition(() => {
        deleteClientAction(id);
      });
    }
  };

  const filteredClients = allClients.filter(client => {
    const name = client.name || "";
    const niche = client.niche || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          niche.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search clients by name or niche..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-sm uppercase">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.niche}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(client.id)}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {client.phone || "Add Contact Number"}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">
                    {client.pricing_model === 'per_thumbnail' ? 'Per Thumbnail' : 'Monthly'}
                  </span>
                  <p className="font-semibold text-gray-900">
                    ₹{client.monthly_price || client.monthlyPrice}
                    {client.pricing_model === 'per_thumbnail' ? '/thumb' : '/mo'}
                  </p>
                </div>
                <StatusBadge status={client.status} />
              </div>
            </div>
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            {allClients.length === 0 ? 'No clients found. Click "Add Client" to get started!' : 'No clients match your search.'}
          </div>
        )}
      </div>
    </>
  );
}
