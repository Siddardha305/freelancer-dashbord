'use client'

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { wipeDatabaseAction } from "@/lib/db-diagnostics";

export function WipeDatabaseButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleWipe = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsWiping(true);
    try {
      const result = await wipeDatabaseAction();
      if (result.success) {
        setStatus("success");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsWiping(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest">Nuclear Option</h3>
          <p className="text-xs text-red-500 font-medium mt-1 uppercase tracking-wider">Completely wipe all clients, tasks, and payments</p>
        </div>
      </div>

      <button
        onClick={handleWipe}
        disabled={isWiping || status === 'success'}
        className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg ${
          status === 'success' 
            ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default'
            : isConfirming 
              ? 'bg-red-600 text-white shadow-red-200 animate-pulse' 
              : 'bg-white text-red-600 border border-red-100 hover:bg-red-600 hover:text-white shadow-red-50'
        } flex items-center gap-2`}
      >
        {isWiping ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Wiping Database...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Database Cleared
          </>
        ) : isConfirming ? (
          "Click Again to Confirm"
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            Wipe Entire Database
          </>
        )}
      </button>

      {isConfirming && (
        <button 
          onClick={() => setIsConfirming(false)}
          className="absolute top-2 right-4 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
