'use client'

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export function PaymentHeader({ onCreateInvoice }: { onCreateInvoice: () => void }) {
  return (
    <PageHeader
      title="Payments & Invoices"
      description="Track your revenue and pending collections"
      action={
        <button 
          onClick={onCreateInvoice}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      }
    />
  );
}
