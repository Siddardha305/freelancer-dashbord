'use client'

import { useState, useEffect } from "react";
import { Download, CheckCircle2, Clock, AlertCircle, Trash2, DollarSign, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { updatePaymentStatusAction, deletePaymentAction } from "@/features/payments/actions/payment-actions";
import { downloadCSV } from "@/lib/export-utils";

export function PaymentTable({ initialPayments = [] }: { initialPayments?: any[] }) {
  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const handleExportCSV = () => {
    const data = payments.map(p => ({
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
      current.map(p => p.id === id ? { ...p, payment_status: newStatus } : p)
    );

    try {
      const result = await updatePaymentStatusAction(id, newStatus);
      if (result.message !== 'success') throw new Error();
    } catch (error) {
      setPayments(previousPayments);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    // Optimistic Update
    const previousPayments = [...payments];
    setPayments(current => current.filter(p => p.id !== id && p._id !== id));

    try {
      const result = await deletePaymentAction(id);
      if (result.message !== 'success') {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete invoice.");
      setPayments(previousPayments);
    }
  };

  // Real-time KPI calculations
  const totalCollected = payments.filter((p: any) => p.payment_status === "Paid").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const totalPending = payments.filter((p: any) => p.payment_status === "Pending").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  const totalOverdue = payments.filter((p: any) => p.payment_status === "Overdue").reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
  
  const pendingCount = payments.filter((p: any) => p.payment_status === "Pending").length;
  const overdueCount = payments.filter((p: any) => p.payment_status === "Overdue").length;

  const statusConfigs = [
    { name: "Paid", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", active: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
    { name: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", active: "bg-amber-600 text-white border-amber-600 shadow-sm" },
    { name: "Overdue", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", active: "bg-red-600 text-white border-red-600 shadow-sm" },
  ];

  return (
    <div className="space-y-10">
      {/* Real-Time Financial Summary Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="w-24 h-24 text-emerald-600" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Collected</p>
          <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter">₹{totalCollected.toLocaleString()}</p>
          <div className="mt-6 flex items-center text-[10px] font-bold text-emerald-600 gap-1 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
            <ArrowUpRight className="w-3 h-3" />
            <span>Success</span>
          </div>
        </div>
        
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-amber-600">
            <FileText className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
          <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter">₹{totalPending.toLocaleString()}</p>
          <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pendingCount} awaiting payment</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 text-red-600">
            <ArrowDownRight className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Overdue Amount</p>
          <p className="mt-2 text-4xl font-bold text-slate-900 tracking-tighter text-red-600">₹{totalOverdue.toLocaleString()}</p>
          <p className="mt-6 text-[10px] font-bold text-red-400 uppercase tracking-widest">{overdueCount} critical alerts</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Recent Invoices</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Real-time payment tracking</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 active:scale-95"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoice</th>
                <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                <th className="px-10 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Action</th>
                <th className="px-10 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{payment.id.slice(-6)}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-slate-900">{payment.client}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-base font-bold text-slate-900 tracking-tight">₹{Number(payment.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs text-slate-500 font-medium uppercase">{payment.due_date}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
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
                                : `border-transparent text-slate-400 hover:text-slate-600`
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {isActive && config.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


