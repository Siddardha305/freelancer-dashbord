'use client'

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import { updatePaymentStatusAction, deletePaymentAction } from "@/dashboard/payments/actions/payment-actions";
import { downloadCSV, downloadInvoice } from "@/lib/export-utils";
import { useCurrency } from "@/context/CurrencyContext";
import { motion } from "framer-motion";

import { Payment, PaymentStatus } from "@/types/payment";
import { Client } from "@/types/client";
import { Work } from "@/types/work";

interface PaymentTableProps {
  initialPayments?: Payment[];
  clients?: Client[];
  works?: Work[];
  currentUser?: { agencyName?: string; agencyLogoUrl?: string; agencyLogoDarkUrl?: string; agencyScannerUrl?: string; agencyBrandingMode?: "logo" | "text" | "both" } | null;
}

function getLineItemsForPayment(payment: Payment, clients: Client[], works: Work[]) {
  const clientObj = clients.find(c => c.name === payment.client);
  const quota = clientObj?.thumbnails_per_month || 8;
  const ratePerTask = clientObj?.price_per_thumbnail && clientObj.price_per_thumbnail > 0
    ? clientObj.price_per_thumbnail
    : (quota > 0 ? (clientObj?.monthly_price || 0) / quota : 0);

  const dateVal = payment.invoiceDate || payment.createdAt;
  const invDate = dateVal ? new Date(dateVal) : new Date();
  const start = new Date(invDate.getFullYear(), invDate.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(invDate.getFullYear(), invDate.getMonth() + 1, 0, 23, 59, 59, 999);

  const completedTasks = works.filter((w) => {
    if (w.client !== payment.client) return false;
    if ((w.status as string) !== 'Completed' && w.status !== 'Done') return false;
    const dateStr = w.completedAt || w.updatedAt || w.createdAt;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= start && d <= end;
  });

  return completedTasks.map(w => ({
    title: w.title,
    amount: ratePerTask
  }));
}

const tabs = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_3m', label: 'Last 3M' },
  { id: 'last_year', label: 'Last Year' },
  { id: 'all', label: 'All' }
] as const;

export function PaymentTable({ 
  initialPayments = [],
  clients = [],
  works = [],
  currentUser
}: PaymentTableProps) {
  const queryClient = useQueryClient();
  const [payments, setPayments] = useState(initialPayments);
  const [prevInitialPayments, setPrevInitialPayments] = useState(initialPayments);
  const [timeframe, setTimeframe] = useState<'all' | 'this_month' | 'last_month' | 'last_3m' | 'last_year'>('this_month');
  const { symbol, formatCurrency } = useCurrency();

  if (initialPayments !== prevInitialPayments) {
    setPrevInitialPayments(initialPayments);
    setPayments(initialPayments);
  }

  const filteredPayments = useMemo(() => {
    const now = new Date();
    return payments.filter(p => {
      const dateVal = p.invoiceDate || p.createdAt;
      if (!dateVal) return true;
      const d = new Date(dateVal);

      if (timeframe === 'all') return true;
      
      if (timeframe === 'this_month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      
      if (timeframe === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return d >= lastMonth && d <= lastMonthEnd;
      }
      
      if (timeframe === 'last_3m') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
        return d >= threeMonthsAgo;
      }
      
      if (timeframe === 'last_year') {
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0);
        return d >= oneYearAgo;
      }
      
      return true;
    });
  }, [payments, timeframe]);

  const handleDownloadInvoice = (payment: Payment) => {
    const lineItems = getLineItemsForPayment(payment, clients, works);

    const clientObj = clients.find(c => c.name === payment.client);
    const quota = clientObj?.thumbnails_per_month || 8;
    const ratePerTask = clientObj?.price_per_thumbnail && clientObj.price_per_thumbnail > 0
      ? clientObj.price_per_thumbnail
      : (quota > 0 ? (clientObj?.monthly_price || 0) / quota : 0);

    downloadInvoice(
      payment,
      symbol,
      currentUser?.agencyName,
      currentUser?.agencyLogoUrl,
      currentUser?.agencyBrandingMode || "both",
      lineItems,
      ratePerTask,
      currentUser?.agencyScannerUrl
    );
  };

  const handleExportCSV = () => {
    const data = filteredPayments.map(p => ({
      InvoiceID: p.id.slice(-6).toUpperCase(),
      Client: p.client,
      Amount: p.amount,
      Status: p.payment_status,
      DueDate: p.due_date
    }));
    downloadCSV(data, `Invoices_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previousPayments = [...payments];
    setPayments(current => 
      current.map(p => p.id === id ? { ...p, payment_status: newStatus as PaymentStatus } : p)
    );

    try {
      const result = await updatePaymentStatusAction(id, newStatus);
      if (result.message !== 'success') throw new Error();
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch (error) {
      console.error("Payment status update failed, rolling back:", error);
      setPayments(previousPayments);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    // Optimistic Update
    const previousPayments = [...payments];
    setPayments(current => current.filter(p => p.id !== id && (p as { _id?: string })._id !== id));

    try {
      const result = await deletePaymentAction(id);
      if (result.message !== 'success') {
        throw new Error(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete invoice.");
      setPayments(previousPayments);
    }
  };

  const statusConfigs = [
    { name: "Paid", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", active: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
    { name: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", active: "bg-amber-600 text-white border-amber-600 shadow-sm" },
    { name: "Overdue", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", active: "bg-red-600 text-white border-red-600 shadow-sm" },
  ];

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-slate-950/60 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Recent Invoices</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Real-time payment tracking</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sliding Timeframe Tab Selector */}
            <div className="flex bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-800/80 gap-1 select-none">
              {tabs.map((tab) => {
                const isActive = timeframe === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTimeframe(tab.id)}
                    className={`relative px-4 py-2 text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition-colors duration-200 cursor-pointer ${
                      isActive 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeInvoiceTab"
                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/20 dark:border-slate-700/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleExportCSV}
              className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-100 dark:border-slate-800/60 active:scale-95 cursor-pointer"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 animate-none">
                <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-4 sm:px-6 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status Action</th>
                <th className="px-4 sm:px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors group">
                  <td className="px-4 sm:px-6 py-6">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{payment.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-6">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{payment.client}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-6">
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-6">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">{payment.due_date}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-6">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                      {statusConfigs.map((config) => {
                        const Icon = config.icon;
                        const isActive = payment.payment_status === config.name;
                        return (
                          <button
                            key={config.name}
                            onClick={() => handleStatusChange(payment.id, config.name)}
                            title={config.name}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                              isActive 
                                ? config.active 
                                : `border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300`
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {isActive && config.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-6 text-right flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleDownloadInvoice(payment)}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="p-2.5 text-slate-350 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                      title="Delete Invoice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">No invoices found for this timeframe</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
