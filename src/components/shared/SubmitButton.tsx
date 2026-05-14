'use client'

import React from 'react'
import { Loader2, LucideIcon } from 'lucide-react'

interface SubmitButtonProps {
  isPending: boolean
  label: string
  pendingLabel?: string
  icon?: LucideIcon
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
}

export function SubmitButton({ 
  isPending, 
  label, 
  pendingLabel = "Saving...", 
  icon: Icon,
  className = "",
  variant = 'primary'
}: SubmitButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  }

  return (
    <button 
      type="submit" 
      disabled={isPending} 
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </>
      )}
    </button>
  )
}
