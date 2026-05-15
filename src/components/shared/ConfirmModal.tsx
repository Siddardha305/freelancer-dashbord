'use client'

import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variants = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-100",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200 animate-in zoom-in-95 duration-300">
        
        <div className="p-10 space-y-6 text-center">
          <div className={cn(
            "h-20 w-20 mx-auto rounded-[2rem] flex items-center justify-center border shadow-sm",
            variant === 'danger' ? 'bg-red-50 border-red-100 text-red-500' :
            variant === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-500' :
            'bg-indigo-50 border-indigo-100 text-indigo-500'
          )}>
            <AlertTriangle className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-3 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50",
                variants[variant]
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmText}
            </button>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
