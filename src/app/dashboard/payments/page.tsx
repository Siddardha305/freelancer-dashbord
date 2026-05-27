'use client'

import React, { useEffect, useState } from 'react';
import { PaymentTable } from "@/dashboard/payments/components/PaymentTable";
import { PaymentHeader } from "@/dashboard/payments/components/PaymentHeader";
import { MonthlyPayoutSummary } from "@/dashboard/payments/components/MonthlyPayoutSummary";
import { PaymentSummaryCards } from "@/dashboard/payments/components/PaymentSummaryCards";
import { getPaymentsAction } from '@/dashboard/payments/actions/payment-actions';
import { AddPaymentModal } from "@/dashboard/payments/components/AddPaymentModal";

import { Payment } from '@/types/payment';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Prefilled invoice modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [prefilledClient, setPrefilledClient] = useState<string | undefined>(undefined);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getPaymentsAction();
        setPayments(data);
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPayments();
    // Enable 5-second live polling for real-time synchronization
    const interval = setInterval(loadPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const refreshData = async () => {
    const data = await getPaymentsAction();
    setPayments(data);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <PaymentHeader onCreateInvoice={() => {
        setPrefilledClient(undefined);
        setPrefilledAmount(undefined);
        setIsInvoiceModalOpen(true);
      }} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* 4 Financial KPI Summary Cards at the absolute top */}
          <PaymentSummaryCards payments={payments} />
          
          {/* Monthly Payout Summary section */}
          <MonthlyPayoutSummary onCreateInvoice={(clientName, amount) => {
            setPrefilledClient(clientName);
            setPrefilledAmount(amount);
            setIsInvoiceModalOpen(true);
          }} />
          
          {/* Recent Invoices Table section */}
          <PaymentTable initialPayments={payments} />
        </div>
      </main>

      <AddPaymentModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        onSuccess={refreshData}
        initialClient={prefilledClient}
        initialAmount={prefilledAmount}
      />
    </div>
  );
}
