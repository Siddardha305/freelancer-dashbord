'use client'

import { useEffect, useState } from 'react';
import { getDatabaseDiagnostics } from "@/lib/db-diagnostics";
import { Database, HardDrive, Layers, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { WipeDatabaseButton } from "./WipeDatabaseButton";
import { ResetWorkspaceButton } from "./ResetWorkspaceButton";

export function DiagnosticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    const result = await getDatabaseDiagnostics();
    if (result.success) {
      setData(result);
      setError(null);
    } else {
      setError(result.error || "Failed to load diagnostics");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Running System Check...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex items-center gap-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-xl font-bold text-red-900 tracking-tight">Diagnostics Failed</h1>
          <p className="text-sm text-red-600 font-medium mt-1">{error}</p>
          <button 
            onClick={fetchDiagnostics}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
          >
            Retry Diagnostics
          </button>
        </div>
      </div>
    );
  }

  const { stats, counts } = data;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">System Health</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time database & storage verification</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
         </div>
      </header>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <HardDrive className="h-20 w-20" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Used</p>
            <h2 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stats?.storageUsedMB} MB</h2>
            <div className="mt-6 space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Quota</span>
                  <span className="text-slate-900">512 MB</span>
               </div>
               <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${(Number(stats?.storageUsedMB) / 512 * 100).toFixed(2)}%` }} 
                  />
               </div>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <Database className="h-20 w-20" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Objects</p>
            <h2 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">
              {(counts?.clients || 0) + (counts?.works || 0) + (counts?.payments || 0)}
            </h2>
            <div className="mt-6 flex items-center gap-2">
               <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Database Synced</span>
            </div>
         </div>
      </div>

      {/* Record Breakdown */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
         <div className="flex items-center gap-3 mb-8">
            <Layers className="h-4 w-4 text-indigo-600" />
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Record Breakdown</h3>
         </div>
         
         <div className="grid grid-cols-3 gap-8">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clients</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">{counts?.clients || 0}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">{counts?.works || 0}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoices</p>
               <p className="text-2xl font-black text-slate-900 tracking-tighter">{counts?.payments || 0}</p>
            </div>
         </div>
      </div>

      <div className="pt-4 grid grid-cols-1 gap-4">
        <ResetWorkspaceButton />
        <WipeDatabaseButton />
      </div>

      <div className="text-center pt-8">
         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">System Architecture • MongoDB Cloud Atlas</p>
      </div>
    </div>
  );
}
