'use client'

import { Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

interface PaymentHeaderProps {
  onCreateInvoice: () => void;
  onGenerateAll?: () => void;
  isGenerating?: boolean;
}

export function PaymentHeader({ 
  onCreateInvoice, 
  onGenerateAll,
  isGenerating = false 
}: PaymentHeaderProps) {
  return (
    <PageHeader
      title="Payments & Invoices"
      description="Track your revenue and pending collections"
      action={
        <div className="flex items-center gap-3">
          <button 
            onClick={onCreateInvoice}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 border border-slate-200/50 dark:border-slate-700/30 shadow-xs"
          >
            <Plus className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Create Invoice
          </button>

          {onGenerateAll && (
            <button 
              onClick={onGenerateAll}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-md shadow-indigo-500/10 dark:shadow-none"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Create All Invoices'}
            </button>
          )}
        </div>
      }
    />
  );
}

