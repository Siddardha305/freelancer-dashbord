'use client'

import { useState } from "react";
import { RotateCcw, Loader2, Info, CheckCircle2 } from "lucide-react";
import { resetWorkspaceAction } from "@/lib/db-diagnostics";

export function ResetWorkspaceButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleReset = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetWorkspaceAction();
      if (result.success) {
        setStatus("success");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsResetting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Reset Activity</h3>
          <p className="text-xs text-indigo-500 font-medium mt-1 uppercase tracking-wider">Wipe all tasks and invoices while keeping your clients</p>
        </div>
      </div>

      <button
        onClick={handleReset}
        disabled={isResetting || status === 'success'}
        className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg ${
          status === 'success' 
            ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default'
            : isConfirming 
              ? 'bg-indigo-600 text-white shadow-indigo-200 animate-pulse' 
              : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white shadow-indigo-50'
        } flex items-center gap-2`}
      >
        {isResetting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting Data...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Activity Reset
          </>
        ) : isConfirming ? (
          "Click Again to Confirm"
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            Reset Activity Only
          </>
        )}
      </button>

      {isConfirming && (
        <button 
          onClick={() => setIsConfirming(false)}
          className="absolute top-2 right-4 text-[10px] font-bold text-indigo-400 hover:text-indigo-600 uppercase tracking-widest"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
