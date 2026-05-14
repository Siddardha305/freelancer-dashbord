import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-500 mb-4">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-6 text-center max-w-xs">{description}</p>
      {action}
    </div>
  )
}
