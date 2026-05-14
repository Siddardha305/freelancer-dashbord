'use client'

import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, DollarSign, Image as ImageIcon, LayoutDashboard, FileBarChart, PieChart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPaymentsAction } from '@/features/payments/actions/payment-actions';
import { getWorksAction } from '@/features/work/actions/work-actions';
import { downloadCSV } from '@/lib/export-utils';

export default function ReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [paymentsData, worksData] = await Promise.all([
          getPaymentsAction(),
          getWorksAction()
        ]);
        setPayments(paymentsData);
        setWorks(worksData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // Enable 5-second live polling for real-time synchronization
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    const reportData = payments.map(p => ({
      InvoiceID: p.id.slice(-6).toUpperCase(),
      Client: p.client,
      Amount: p.amount,
      Status: p.payment_status,
      DueDate: p.due_date,
      CreatedAt: new Date(p.createdAt).toLocaleDateString()
    }));
    downloadCSV(reportData, `Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleGetPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin shadow-sm"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Generating Reports...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = payments
    .filter((p: any) => p.payment_status === "Paid")
    .reduce((acc, p: any) => acc + Number(p.amount), 0);

  const pendingRevenue = payments
    .filter((p: any) => p.payment_status === "Pending")
    .reduce((acc, p: any) => acc + Number(p.amount), 0);

  const completedWorks = works.filter((w: any) => w.status === "Completed").length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 print:bg-white">
      <style jsx global>{`
        @media print {
          nav, aside, button, .print-hide { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .print-break-inside-avoid { page-break-inside: avoid; }
          .flex-1 { overflow: visible !important; }
          .overflow-y-auto { overflow: visible !important; }
        }
      `}</style>
      <PageHeader
        title="Reports & Analytics"
        description="Monitor your financial performance and delivery metrics"
        action={
          <div className="flex gap-4 print-hide">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              Export CSV
            </button>
            <button 
              onClick={handleGetPDF}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Get PDF Report
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-10">
          
          {/* Main Highlights */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <DollarSign className="w-32 h-32 text-indigo-600" />
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 w-fit mb-6">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Revenue</h3>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">₹{totalRevenue.toLocaleString()}</p>
                <div className="mt-6 flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Growth +12%</span>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-32 h-32 text-amber-600" />
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 w-fit mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Invoices</h3>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">₹{pendingRevenue.toLocaleString()}</p>
                <div className="mt-6 flex items-center gap-2 text-slate-400">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting payout</span>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <ImageIcon className="w-32 h-32 text-emerald-600" />
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 w-fit mb-6">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Deliveries</h3>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">{completedWorks}</p>
                <div className="mt-6 flex items-center gap-2 text-indigo-600">
                  <FileBarChart className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Completed Items</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-12 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Revenue Analysis</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Monthly collection distribution</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-[1.5rem] text-slate-400">
                  <PieChart className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-10">Add more billing records to unlock advanced revenue distribution charts</p>
              </div>
            </div>
            
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-12 min-h-[400px] flex flex-col">
               <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Performance Metrics</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Client success & delivery speed</p>
                </div>
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem]">
                  <FileBarChart className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center px-10">Historical data is required to calculate growth trends and top clients</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

