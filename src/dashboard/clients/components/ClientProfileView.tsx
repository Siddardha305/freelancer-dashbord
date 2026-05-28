'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EditClientModal } from "@/dashboard/clients/components/EditClientModal";
import { deleteClientAction } from "@/dashboard/clients/actions/client-actions";
import { useQuery } from "@tanstack/react-query";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import { useCurrency } from "@/context/CurrencyContext";
import { Client } from "@/types/client";
import { Work } from "@/types/work";

// Modular Sub-Components
import { ClientProfileHeader } from "./ClientProfileHeader";
import { ClientMetricsGrid } from "./ClientMetricsGrid";
import { ClientInfoPane } from "./ClientInfoPane";
import { ClientActivitySidebar } from "./ClientActivitySidebar";
import { ClientPortalSettingsForm } from "./ClientPortalSettingsForm";

interface ClientProfileViewProps {
  initialClient: Client;
  onClose?: () => void;
  onSuccess?: (updatedClient: Client | null) => void;
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
  const [client, setClient] = useState<Client>(initialClient);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'portal'>('overview');

  const [prevInitialClient, setPrevInitialClient] = useState(initialClient);
  if (initialClient !== prevInitialClient) {
    setPrevInitialClient(initialClient);
    setClient(initialClient);
  }

  const { data: tasks = [] } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
    refetchInterval: 10000,
  });

  const [currentTimestamp] = useState(() => Date.now());

  const clientTasks = (tasks as Work[]).filter((t: Work) => t.client === client.name);

  // 1. Quota & deliveries calculation
  const monthlyQuota = client.thumbnails_per_month || 8;
  const pricePerThumbnail = client.price_per_thumbnail || (client.pricing_model === 'monthly' ? ((client.monthly_price || 0) / monthlyQuota) : 500) || 500;
  
  // Total target monthly contract amount
  const monthlyPrice = client.pricing_model === 'monthly' 
    ? (client.monthly_price || 4000) 
    : (monthlyQuota * pricePerThumbnail);

  // Completed/Done tasks this month
  const now = new Date();
  const currentMonthTasks = clientTasks.filter((t: Work) => {
    if (t.status as string !== "Completed" && t.status !== "Done") return false;
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
  const pendingTasks = clientTasks.filter((t: Work) => 
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
  const daysUntilExpiry = contractEnd ? Math.ceil((contractEnd.getTime() - currentTimestamp) / (1000 * 60 * 60 * 24)) : null;
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
      console.error("Failed to delete client from profile view:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = (updatedClient: Client) => {
    setClient(updatedClient);
    if (onSuccess) {
      onSuccess(updatedClient);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-background ${isDrawerMode ? 'p-6 lg:p-8' : 'p-8 lg:p-12'}`}>
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Profile Header navigation & controls */}
        <ClientProfileHeader 
          client={client}
          isDrawerMode={isDrawerMode}
          onClose={onClose}
          onDeleteClick={() => setIsDeleteModalOpen(true)}
          onEditClick={() => setIsEditModalOpen(true)}
          priorityColors={priorityColors}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-card-border/80 pb-px gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold tracking-tight border-b-2 cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`pb-4 text-sm font-bold tracking-tight border-b-2 cursor-pointer transition-all ${
              activeTab === 'portal'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
            }`}
          >
            Client Portal Settings
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className={`grid grid-cols-1 ${isDrawerMode ? 'gap-6' : 'lg:grid-cols-3 gap-8'}`}>
            
            {/* Main Info Column */}
            <div className={`${isDrawerMode ? 'space-y-6' : 'lg:col-span-2 space-y-8'}`}>
              
              {/* Quick Actions & Billing trackers */}
              <ClientMetricsGrid 
                client={client}
                now={now}
                earnedThisMonth={earnedThisMonth}
                pendingAmount={pendingAmount}
                amountBalance={amountBalance}
                monthlyPrice={monthlyPrice}
                deliveriesUsed={deliveriesUsed}
                monthlyQuota={monthlyQuota}
                deliveriesBalance={deliveriesBalance}
                pendingCount={pendingCount}
                formatCurrency={formatCurrency}
              />

              {/* Contract & Revenue pane details */}
              <ClientInfoPane 
                client={client}
                isExpiringSoon={isExpiringSoon}
                formatCurrency={formatCurrency}
              />

            </div>

            {/* Sidebar Info Column */}
            <ClientActivitySidebar 
              client={client}
              healthScore={healthScore}
              clientTasks={clientTasks}
              currentTimestamp={currentTimestamp}
            />

          </div>
        ) : (
          <ClientPortalSettingsForm
            key={client.id}
            client={client} 
            onSuccess={(updatedClient) => {
              setClient(updatedClient);
              if (onSuccess) onSuccess(updatedClient);
            }} 
          />
        )}

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
