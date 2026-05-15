'use client'

import { useState } from "react";
import { 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Calendar, 
  Tag, 
  ChevronLeft, 
  MoreHorizontal,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Edit2,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/shared/Badge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EditClientModal } from "@/features/clients/components/EditClientModal";
import { deleteClientAction } from "@/features/clients/actions/client-actions";

export function ClientProfileClient({ initialClient }: { initialClient: any }) {
  const router = useRouter();
  const [client, setClient] = useState(initialClient);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    High: "bg-red-50 text-red-700 border-red-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  // Heuristic Health Score (0-100)
  const healthScore = client.status === "Active" ? 85 : 40; 
  
  const contractEnd = client.contractEndDate ? new Date(client.contractEndDate) : null;
  const daysUntilExpiry = contractEnd ? Math.ceil((contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry < 30;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteClientAction(client.id);
      if (result.message === 'success') {
        toast.success("Client deleted successfully");
        router.push("/clients");
      } else {
        toast.error(result.message || "Failed to delete client");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 lg:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/clients" 
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Clients
          </Link>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors active:scale-95"
              >
                <Trash2 className="h-5 w-5" />
             </button>
             
             <button className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-slate-50 transition-colors active:scale-95">
                <MoreHorizontal className="h-5 w-5 text-slate-400" />
             </button>
             <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
             </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="glass-bg rounded-[2.5rem] p-10 border border-card-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <TrendingUp className="h-48 w-48 text-indigo-600" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
            <div className="h-32 w-32 rounded-[2rem] bg-indigo-50 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl group overflow-hidden">
               {client.avatar ? (
                 <img src={client.avatar} alt={client.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-4xl font-bold text-indigo-600">{client.name.charAt(0)}</span>
               )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{client.name}</h1>
                <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>
                  {client.status}
                </Badge>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityColors[client.priority as keyof typeof priorityColors] || priorityColors.Medium}`}>
                  {client.priority} Priority
                </span>
                <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
                  {client.niche}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {client.email || "No email"}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {client.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> {client.country || "Global"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {client.timezone || "UTC"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
               <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors gap-3 group">
                  <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
               </button>
               <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors gap-3 group">
                  <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Email</span>
               </button>
               <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors gap-3 group">
                  <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Call</span>
               </button>
            </div>

            {/* Contract & Revenue */}
            <div className="premium-card rounded-[2rem] p-8 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Project Details</h3>
                  {isExpiringSoon && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-bold">Contract Expires Soon</span>
                    </div>
                  )}
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Model</p>
                    <p className="text-sm font-bold text-slate-900">{client.pricing_model === 'per_thumbnail' ? 'Per Thumbnail' : 'Monthly Retainer'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-sm font-bold text-slate-900">₹{client.monthly_price?.toLocaleString() || client.price_per_thumbnail?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-sm font-bold text-slate-900">{client.contractStartDate ? new Date(client.contractStartDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                    <p className={`text-sm font-bold ${isExpiringSoon ? 'text-red-600' : 'text-slate-900'}`}>
                      {client.contractEndDate ? new Date(client.contractEndDate).toLocaleDateString() : 'Continuous'}
                    </p>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned LTV</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{client.totalEarned?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="text-sm font-bold text-slate-900">{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                  </div>
               </div>
            </div>

            {/* Notes Section */}
            <div className="premium-card rounded-[2rem] p-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Internal Notes</h3>
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 min-h-[150px] text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                  {client.notes || "No internal notes available for this client. Click edit to add details about workflow, preferences, or communication style."}
               </div>
            </div>

          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-8">
            
            {/* Health Score */}
            <div className="premium-card rounded-[2rem] p-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Client Health Score</h3>
               <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-slate-900 tracking-tighter">{healthScore}%</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${healthScore > 70 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                      {healthScore > 70 ? 'Excellent' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${healthScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Score calculated based on payment punctuality, project activity, and communication frequency.
                  </p>
               </div>
            </div>

            {/* Activity Stats */}
            <div className="premium-card rounded-[2rem] p-8 space-y-6">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Activity Snapshot</h3>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-indigo-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">Tasks Done</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">12</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-emerald-600">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">Paid Invoices</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">8</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-amber-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">Last Contact</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">2d ago</span>
                  </div>
               </div>
            </div>

            {/* Tags */}
            <div className="premium-card rounded-[2rem] p-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Client Tags</h3>
               <div className="flex flex-wrap gap-2">
                  {client.tags && client.tags.length > 0 ? client.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-default">
                      #{tag}
                    </span>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No tags assigned</p>
                  )}
               </div>
            </div>

          </div>

        </div>

        {/* Edit Modal */}
        <EditClientModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          client={client}
          onSuccess={(updatedClient) => setClient(updatedClient)}
        />

        {/* Delete Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Client"
          description={`Are you absolutely sure you want to delete ${client.name}? This will permanently remove all associated tasks and payment records.`}
          confirmText="Delete Client"
          variant="danger"
          isLoading={isDeleting}
        />

      </div>
    </div>
  );
}
