'use client'

import { useState } from "react";
import { MoreHorizontal, Mail, Play, Trash2, Edit3, ArrowRight, ExternalLink, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { deleteClientAction } from "@/features/clients/actions/client-actions";

export function ClientTable({ clients = [] }: { clients?: any[] }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Deduplicate by id — guard against any duplicate entries from polling race conditions
  const uniqueClients = clients.filter(
    (c, index, self) => index === self.findIndex((x) => x.id === c.id)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    
    try {
      const result = await deleteClientAction(id);
      if (result.message !== 'success') throw new Error(result.message);
      // The parent will refresh via polling or we could add a callback
    } catch (error) {
      alert("Failed to delete client.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
      {uniqueClients.map((client) => (
        <div key={client.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-500 group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 text-xl font-black border border-slate-100 shadow-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.niche}</p>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                  className={`p-2 rounded-xl transition-all ${activeMenu === client.id ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {activeMenu === client.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 uppercase tracking-wider transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Client
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 uppercase tracking-wider transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Client
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {client.channel_link ? (
                <a 
                  href={client.channel_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 group/link transition-all hover:bg-indigo-600 hover:border-indigo-600 shadow-sm shadow-indigo-100/50"
                >
                  <Play className="h-5 w-5 text-indigo-500 group-hover/link:text-white transition-colors" />
                  <span className="text-xs font-bold text-indigo-600 flex-1 truncate group-hover/link:text-white transition-colors uppercase tracking-widest">Visit YouTube Channel</span>
                  <ExternalLink className="h-4 w-4 text-indigo-300 group-hover/link:text-white transition-colors" />
                </a>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Link Provided</span>
                </div>
              )}

              {client.email && (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 group/item transition-colors hover:border-slate-200">
                  <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-500 truncate group-hover/item:text-slate-700">{client.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {client.thumbnails_per_month} Delivery / mo
                </p>
                <p className="text-xl font-black text-slate-900 tracking-tighter">
                  ₹{client.monthly_price?.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <StatusBadge status={client.status || 'Active'} />
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Retainer</p>
              </div>
            </div>
          </div>
        </div>
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
  );
}

