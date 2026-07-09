'use client'

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentTable } from "@/dashboard/payments/components/PaymentTable";
import { PaymentHeader } from "@/dashboard/payments/components/PaymentHeader";
import { MonthlyPayoutSummary } from "@/dashboard/payments/components/MonthlyPayoutSummary";
import { PaymentSummaryCards } from "@/dashboard/payments/components/PaymentSummaryCards";
import { getPaymentsAction, generateAllInvoicesAction } from '@/dashboard/payments/actions/payment-actions';
import { AddPaymentModal } from "@/dashboard/payments/components/AddPaymentModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { Payment } from '@/types/payment';
import { Client } from '@/types/client';
import { Work } from '@/types/work';
import { getClientsAction } from '@/dashboard/clients/actions/client-actions';
import { getWorksAction } from '@/dashboard/work/actions/work-actions';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';

export default function PaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<{ 
    teamRole?: string;
    agencyName?: string; 
    agencyLogoUrl?: string; 
    agencyLogoDarkUrl?: string; 
    agencyScannerUrl?: string; 
    agencyBrandingMode?: "logo" | "text" | "both";
    workspaceType?: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Prefilled invoice modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [prefilledClient, setPrefilledClient] = useState<string | undefined>(undefined);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);

  // Batch invoice generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: getPaymentsAction,
    refetchInterval: 5000,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: getClientsAction,
    refetchInterval: 5000,
  });

  const { data: works = [], isLoading: isLoadingWorks } = useQuery<Work[]>({
    queryKey: ['works'],
    queryFn: getWorksAction,
    refetchInterval: 5000,
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
      } catch (error) {
        console.error("Error loading payments page user:", error);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  const loading = isLoadingPayments || isLoadingClients || isLoadingWorks || loadingUser;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isCorporate = currentUser?.workspaceType === 'corporate';
  if (currentUser?.teamRole === 'editor' || currentUser?.teamRole === 'viewer' || isCorporate) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 dark:text-red-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Access Restricted</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Your team role (<span className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase">{currentUser.teamRole}</span>) does not have permission to view billing, payments, or invoices in this workspace.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const refreshData = async () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['works'] });
  };

  const handleGenerateAll = () => {
    setIsConfirmOpen(true);
  };

  const executeGenerateAll = async () => {
    setIsConfirmOpen(false);
    setIsGenerating(true);
    try {
      const res = await generateAllInvoicesAction();
      if (res.success) {
        toast.success(res.message);
        refreshData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate invoices");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <PaymentHeader 
        onCreateInvoice={() => {
          setPrefilledClient(undefined);
          setPrefilledAmount(undefined);
          setIsInvoiceModalOpen(true);
        }} 
        onGenerateAll={handleGenerateAll}
        isGenerating={isGenerating}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* 4 Financial KPI Summary Cards at the absolute top */}
          <PaymentSummaryCards payments={payments} clients={clients} works={works} />
          
          {/* Monthly Payout Summary section */}
          <MonthlyPayoutSummary 
            clients={clients}
            works={works}
            payments={payments}
            onCreateInvoice={(clientName, amount) => {
              setPrefilledClient(clientName);
              setPrefilledAmount(amount);
              setIsInvoiceModalOpen(true);
            }} 
            onSuccess={refreshData}
          />
          
          {/* Recent Invoices Table section */}
          <PaymentTable 
            initialPayments={payments} 
            clients={clients}
            works={works}
            currentUser={currentUser}
          />
        </div>
      </main>

      <AddPaymentModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        onSuccess={refreshData}
        initialClient={prefilledClient}
        initialAmount={prefilledAmount}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeGenerateAll}
        title="Generate All Invoices"
        description="Are you sure you want to generate invoices for all active clients this month? This will only create invoices for clients who have a non-zero monthly retainer or completed tasks."
        confirmText="Generate Invoices"
        cancelText="Cancel"
        variant="info"
        isLoading={isGenerating}
      />
    </div>
  );
}

