'use client'

import { useState, useEffect } from "react";
import { 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  MoreHorizontal,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Edit2,
  Trash2,
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/shared/Badge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EditClientModal } from "@/dashboard/clients/components/EditClientModal";
import { deleteClientAction } from "@/dashboard/clients/actions/client-actions";
import { useQuery } from "@tanstack/react-query";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import { format } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";

interface ClientProfileViewProps {
  initialClient: any;
  onClose?: () => void;
  onSuccess?: (updatedClient: any) => void;
  isDrawerMode?: boolean;
}

export function ClientProfileView({ 
  initialClient, 
  onClose, 
  onSuccess, 
  isDrawerMode = false 
}: ClientProfileViewProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [client, setClient] = useState(initialClient);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep state synchronized with parent prop changes (highly critical for drawer reuse)
  useEffect(() => {
    setClient(initialClient);
  }, [initialClient]);

  const { data: tasks = [] } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
    refetchInterval: 10000,
  });

  const clientTasks = tasks.filter((t: any) => t.client === client.name);

  // 1. Quota & deliveries calculation
  const monthlyQuota = client.thumbnails_per_month || 8;
  const pricePerThumbnail = client.price_per_thumbnail || (client.pricing_model === 'monthly' ? (client.monthly_price / monthlyQuota) : 500) || 500;
  
  // Total target monthly contract amount
  const monthlyPrice = client.pricing_model === 'monthly' 
    ? (client.monthly_price || 4000) 
    : (monthlyQuota * pricePerThumbnail);

  // Completed/Done tasks this month
  const now = new Date();
  const currentMonthTasks = clientTasks.filter((t: any) => {
    if (t.status !== "Completed" && t.status !== "Done") return false;
    const dateStr = t.completedAt || t.updatedAt || t.createdAt;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const deliveriesUsed = currentMonthTasks.length;
  const deliveriesBalance = Math.max(0, monthlyQuota - deliveriesUsed);

  // 2. Earnings and Balance calculations
  const earnedThisMonth = deliveriesUsed * pricePerThumbnail;
  const amountBalance = Math.max(0, monthlyPrice - earnedThisMonth);

  // 3. Pending tasks (To Do, In Progress, Review)
  const pendingTasks = clientTasks.filter((t: any) => 
    ["To Do", "In Progress", "Review"].includes(t.status)
  );
  const pendingCount = pendingTasks.length;
  const pendingAmount = pendingCount * pricePerThumbnail;

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
        if (onSuccess) {
          onSuccess(null);
        }
        if (isDrawerMode && onClose) {
          onClose();
        } else {
          router.push("/dashboard/clients");
        }
      } else {
        toast.error(result.message || "Failed to delete client");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = (updatedClient: any) => {
    setClient(updatedClient);
    if (onSuccess) {
      onSuccess(updatedClient);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-background ${isDrawerMode ? 'p-6 lg:p-8' : 'p-8 lg:p-12'}`}>
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          {isDrawerMode ? (
            <button 
              onClick={onClose}
              className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Clients
            </button>
          ) : (
            <Link 
              href="/dashboard/clients" 
              className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Clients
            </Link>
          )}

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors active:scale-95"
                title="Delete Profile"
              >
                <Trash2 className="h-5 w-5" />
             </button>
             
             {isDrawerMode && onClose && (
               <button 
                  onClick={onClose}
                  className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-slate-50 transition-colors active:scale-95 lg:hidden"
                  title="Close Profile"
               >
                  <X className="h-5 w-5 text-slate-400" />
               </button>
             )}

             <button className="p-2.5 rounded-xl border border-card-border bg-card hover:bg-slate-50 transition-colors active:scale-95 hidden sm:inline-flex">
                <MoreHorizontal className="h-5 w-5 text-slate-400" />
             </button>
             <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 animate-in fade-in duration-200"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
             </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="glass-bg rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-card-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <TrendingUp className="h-48 w-48 text-indigo-600" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start md:items-center relative z-10">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-[1.5rem] sm:rounded-[2rem] bg-indigo-50 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl group overflow-hidden shrink-0">
               {client.avatar ? (
                 <img src={client.avatar} alt={client.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-3xl sm:text-4xl font-bold text-indigo-600">{client.name.charAt(0)}</span>
               )}
            </div>
            
            <div className="flex-1 space-y-3 sm:space-y-4 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-full">{client.name}</h1>
                <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>
                  {client.status}
                </Badge>
                <span className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${priorityColors[client.priority as keyof typeof priorityColors] || priorityColors.Medium}`}>
                  {client.priority} Priority
                </span>
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  {client.niche}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{client.email || "No email"}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" /> {client.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0" /> {client.country || "Global"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" /> {client.timezone || "UTC"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isDrawerMode ? 'gap-6' : 'lg:grid-cols-3 gap-8'}`}>
          
          {/* Main Info Column */}
          <div className={`${isDrawerMode ? 'space-y-6' : 'lg:col-span-2 space-y-8'}`}>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
               {client.phone ? (
                 <a 
                   href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors gap-2 sm:gap-3 group"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                 </a>
               ) : (
                 <button 
                   onClick={() => toast.info("No phone number registered for WhatsApp")}
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
                      <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">WhatsApp</span>
                 </button>
               )}

               {client.email ? (
                 <a 
                   href={`mailto:${client.email}`}
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors gap-2 sm:gap-3 group"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                      <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Email</span>
                 </a>
               ) : (
                 <button 
                   onClick={() => toast.info("No email address registered")}
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
                      <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Email</span>
                 </button>
               )}

               {client.phone ? (
                 <a 
                   href={`tel:${client.phone}`}
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors gap-2 sm:gap-3 group"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                      <Phone className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Call</span>
                 </a>
               ) : (
                 <button 
                   onClick={() => toast.info("No phone number registered")}
                   className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 border border-slate-200 opacity-60 gap-2 sm:gap-3 cursor-not-allowed"
                 >
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white shadow-sm">
                      <Phone className="h-4 sm:h-5 w-4 sm:w-5" />
                    </div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">Call</span>
                 </button>
               )}
            </div>

            {/* Quota & Billing Cycle Tracker */}
            <div className="glass-bg rounded-[2rem] p-6 sm:p-8 border border-card-border overflow-hidden relative space-y-6">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <CreditCard className="h-40 w-40 text-indigo-600" />
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Billing & Quota Cycle</h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Current Month Cycle</p>
                </div>
                <Badge variant="success">
                  {format(now, "MMMM yyyy")}
                </Badge>
              </div>

              {/* Graphical Visual Segmented Progress Bar */}
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Earned: {formatCurrency(earnedThisMonth)}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>Pending: {formatCurrency(pendingAmount)}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>Remaining: {formatCurrency(amountBalance)}</span>
                </div>
                
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner">
                  {/* Earned portion */}
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" 
                    style={{ width: `${monthlyPrice > 0 ? (earnedThisMonth / monthlyPrice) * 100 : 0}%` }}
                    title={`Earned: ${formatCurrency(earnedThisMonth)}`}
                  />
                  {/* Pending portion */}
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" 
                    style={{ width: `${monthlyPrice > 0 ? (pendingAmount / monthlyPrice) * 100 : 0}%` }}
                    title={`Pending: ${formatCurrency(pendingAmount)}`}
                  />
                  {/* Remaining portion */}
                  {amountBalance > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-500 opacity-80" 
                      style={{ width: `${monthlyPrice > 0 ? (amountBalance / monthlyPrice) * 100 : 100}%` }}
                      title={`Remaining: ${formatCurrency(amountBalance)}`}
                    />
                  )}
                </div>
                
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span>0%</span>
                  <span>Target Contract Price: {formatCurrency(monthlyPrice)}</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Dynamic Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Deliveries Quota balance */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliveries Quota</span>
                    <Badge variant={deliveriesBalance > 0 ? "success" : "warning"}>
                      {deliveriesBalance} Left
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{deliveriesUsed}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">/ {monthlyQuota} Deliveries</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {deliveriesBalance} remaining this month
                  </p>
                </div>

                {/* Pending Amount card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Amount</span>
                    <Badge variant={pendingCount > 0 ? "warning" : "outline"}>
                      {pendingCount} Tasks
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{formatCurrency(pendingAmount)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Adds when tasks are in progress
                  </p>
                </div>

                {/* Amount Remaining balance */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Balance</span>
                    <Badge variant="info">
                      Remaining
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatCurrency(amountBalance)}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Decrements as tasks complete
                  </p>
                </div>

              </div>

            </div>

            {/* Contract & Revenue */}
            <div className="premium-card rounded-[2rem] p-6 sm:p-8 space-y-6 sm:space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Project Details</h3>
                  {isExpiringSoon && (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-red-100 animate-pulse">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-bold">Contract Expires Soon</span>
                    </div>
                  )}
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing Model</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{client.pricing_model === 'per_thumbnail' ? 'Per Thumbnail' : 'Monthly Retainer'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(client.monthly_price || client.price_per_thumbnail)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{client.contractStartDate ? new Date(client.contractStartDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                    <p className={`text-xs sm:text-sm font-bold ${isExpiringSoon ? 'text-red-600' : 'text-slate-900'}`}>
                      {client.contractEndDate ? new Date(client.contractEndDate).toLocaleDateString() : 'Continuous'}
                    </p>
                  </div>
               </div>

               <div className="pt-6 sm:pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned LTV</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(client.totalEarned || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                  </div>
               </div>
            </div>

            {/* Notes Section */}
            <div className="premium-card rounded-[2rem] p-6 sm:p-8">
               <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Internal Notes</h3>
               <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-100 min-h-[120px] sm:min-h-[150px] text-xs sm:text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                  {client.notes || "No internal notes available for this client. Click edit to add details about workflow, preferences, or communication style."}
               </div>
            </div>

          </div>

          {/* Sidebar Info Column */}
          <div className={`${isDrawerMode ? 'space-y-6' : 'space-y-8'}`}>
            
            {/* Health Score */}
            <div className="premium-card rounded-[2rem] p-6 sm:p-8">
               <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Client Health Score</h3>
               <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tighter">{healthScore}%</span>
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg ${healthScore > 70 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                      {healthScore > 70 ? 'Excellent' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${healthScore > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed">
                    Score calculated based on payment punctuality, project activity, and communication frequency.
                  </p>
               </div>
            </div>

            {/* Activity Stats */}
            <div className="premium-card rounded-[2rem] p-6 sm:p-8 space-y-4 sm:space-y-6">
               <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Activity Snapshot</h3>
               
               <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-indigo-600">
                        <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600">Tasks Done</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{clientTasks.filter((t: any) => t.status === 'Completed' || t.status === 'Done').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-emerald-600">
                        <CreditCard className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600">Active Tasks</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{clientTasks.filter((t: any) => t.status === 'In Progress').length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-sm text-amber-600">
                        <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-600">Last Activity</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                      {(() => {
                        const lastTask = clientTasks.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0];
                        if (!lastTask) return 'No tasks yet';
                        const diff = Math.floor((Date.now() - new Date(lastTask.updatedAt || lastTask.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
                      })()}
                    </span>
                  </div>
               </div>
            </div>

            {/* Tags */}
            <div className="premium-card rounded-[2rem] p-6 sm:p-8">
               <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 sm:mb-6">Client Tags</h3>
               <div className="flex flex-wrap gap-2">
                  {client.tags && client.tags.length > 0 ? client.tags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-default">
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
          onSuccess={handleEditSuccess}
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
