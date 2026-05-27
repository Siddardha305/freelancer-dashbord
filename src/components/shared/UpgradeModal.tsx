'use client'

import { X, Zap, Lock, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  limitName: string // e.g. "Clients limit reached", "Tasks limit reached"
  currentLimitText: string // e.g. "2 active clients", "5 monthly tasks"
  upgradeToPlanName?: string // e.g. "Pro", "Agency"
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Upgrade Your Plan",
  description = "You've hit a usage threshold on your current plan. Upgrade to unlock higher limits and premium features.",
  limitName,
  currentLimitText,
  upgradeToPlanName = "Pro"
}: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Top Header Section with Lock Icon */}
        <div className="p-8 lg:p-10 pb-0 flex flex-col items-center text-center relative z-10">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[1.8rem] flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 relative">
            <Lock className="h-7 w-7 text-white" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900">
              <Sparkles className="h-2.5 w-2.5 text-slate-950 fill-slate-950" />
            </div>
          </div>
          
          <h3 className="text-2xl font-black tracking-tight text-white mb-2">
            {title}
          </h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Limit Comparison Card */}
        <div className="p-8 lg:p-10 py-6 relative z-10">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-500">Current Threshold</span>
              <span className="text-amber-500">{limitName}</span>
            </div>
            
            <div className="h-[1px] bg-slate-800" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hobby Plan</p>
                <p className="text-sm font-extrabold text-slate-300">{currentLimitText}</p>
              </div>
              <div className="space-y-1 border-l border-slate-800 pl-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{upgradeToPlanName} Plan</p>
                <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  {upgradeToPlanName === "Pro" ? "15 Clients / Unlimited Tasks" : "Unlimited Access"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="px-8 lg:px-10 pb-6 space-y-3 relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Unlocks with {upgradeToPlanName}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>Higher Client Limits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>Unlimited Tasks & Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>CSV Ledger Exports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>Revision History Logs</span>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="p-8 lg:p-10 pt-4 flex flex-col gap-3 relative z-10 border-t border-slate-800/50 bg-slate-950/20">
          <Link
            href="/dashboard/settings?tab=pricing"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-950 active:scale-95 text-center cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-white" />
            Upgrade Plan Now
          </Link>
          <button
            onClick={onClose}
            className="w-full px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 rounded-2xl transition-all"
          >
            Stay on Hobby (Cancel)
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
