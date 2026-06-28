'use client';

import React, { useState } from "react";
import { User } from "lucide-react";
import { deleteClientAction } from "@/dashboard/clients/actions/client-actions";
import { EditClientModal } from "@/dashboard/clients/components/EditClientModal";
import { ClientCard } from "./ClientCard";

import { Client } from "@/types/client";

interface ClientTableProps {
  clients?: Client[];
  onUpdate?: () => void;
  onViewProfile?: (client: Client) => void;
}

export function ClientTable({ 
  clients = [], 
  onUpdate,
  onViewProfile
}: ClientTableProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeEditClient, setActiveEditClient] = useState<Client | null>(null);

  // Deduplicate by id — guard against any duplicate entries from polling race conditions
  const uniqueClients = clients.filter(
    (c, index, self) => index === self.findIndex((x) => x.id === c.id)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    
    try {
      const result = await deleteClientAction(id);
      if (result.message !== 'success') throw new Error(result.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to delete client from card table:", error);
      alert("Failed to delete client.");
    }
  };

  const handleEditClick = (client: Client) => {
    setActiveEditClient(client);
    setIsEditOpen(true);
  };

  const handleStatusChange = () => {
    if (onUpdate) onUpdate();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {uniqueClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onViewProfile={onViewProfile}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
        
        {uniqueClients.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <User className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No clients onboarded yet</p>
          </div>
        )}
      </div>

      <EditClientModal
        key={activeEditClient?.id || 'none'}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        client={activeEditClient}
        onSuccess={() => {
          setIsEditOpen(false);
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
}
