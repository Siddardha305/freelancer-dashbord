'use client'

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AddPaymentModal } from "./AddPaymentModal";

export function PaymentHeader({ onSuccess }: { onSuccess?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Payments & Invoices"
        description="Track your revenue and pending collections"
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        }
      />
      <AddPaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onSuccess}
      />
    </>
  );
}
