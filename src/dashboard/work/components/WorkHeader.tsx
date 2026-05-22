'use client'

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AddWorkModal } from "./AddWorkModal";

export function WorkHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Monthly Work"
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        }
      />
      <AddWorkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
