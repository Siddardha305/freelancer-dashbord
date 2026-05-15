import { getDatabaseDiagnostics } from "@/lib/db-diagnostics";
import { Database, HardDrive, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { WipeDatabaseButton } from "@/features/diagnostics/components/WipeDatabaseButton";
import { ResetWorkspaceButton } from "@/features/diagnostics/components/ResetWorkspaceButton";

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
  const result = await getDatabaseDiagnostics();

  if (!result.success) {
    return (
      <div className="p-12">
        <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex items-center gap-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-xl font-bold text-red-900 tracking-tight">Database Connection Failed</h1>
            <p className="text-sm text-red-600 font-medium mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, counts } = result;

  return (
    <div className="p-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">System Health</h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Database & Storage Diagnostics</p>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Database Online</span>
           </div>
        </header>

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <HardDrive className="h-24 w-24" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Status</p>
              <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{stats?.storageUsedMB} MB</h2>
              <div className="mt-6 space-y-2">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Atlas Free Tier</span>
                    <span className="text-slate-900">512 MB</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600" 
                      style={{ width: `${(Number(stats?.storageUsedMB) / 512 * 100).toFixed(2)}%` }} 
                    />
                 </div>
                 <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-widest">
                    {(Number(stats?.storageUsedMB) / 512 * 100).toFixed(2)}% of free quota used
                 </p>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <Database className="h-24 w-24" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Presence</p>
              <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                {(counts?.clients || 0) + (counts?.works || 0) + (counts?.payments || 0)} Records
              </h2>
              <div className="mt-6 flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Verified across all collections</span>
              </div>
           </div>
        </div>

        {/* Record Breakdown */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Record Breakdown</h3>
           </div>
           
           <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Clients</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{counts?.clients || 0}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tasks</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{counts?.works || 0}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoices</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{counts?.payments || 0}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ResetWorkspaceButton />
          <WipeDatabaseButton />
        </div>

        <div className="text-center">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Database Diagnostics Utility • Real-Time Data Verification</p>
        </div>
      </div>
    </div>
  );
}
