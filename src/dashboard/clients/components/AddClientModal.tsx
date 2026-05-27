'use client'

import { useActionState, useState, useEffect } from 'react'
import { createClientAction } from '@/dashboard/clients/actions/client-actions'
import { X, Loader2 } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { Client } from '@/types/client'

interface FormState {
  message: string;
  errors?: Record<string, string[]>;
  client?: Client;
}

const initialState: FormState = {
  message: '',
  errors: {},
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (client?: Client) => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const { symbol, formatCurrency } = useCurrency();
  const [state, formAction, isPending] = useActionState(
    createClientAction as (state: FormState, formData: FormData) => Promise<FormState>,
    initialState
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pricingModel, setPricingModel] = useState('monthly')
  const [thumbnailsCount, setThumbnailsCount] = useState(0)
  const [pricePerUnit, setPricePerUnit] = useState(400)

  // Auto-calculate total price dynamically during render
  const totalPrice = thumbnailsCount * pricePerUnit;

  // Handle successful submission deferredly
  useEffect(() => {
    if (state?.message === 'success' && isOpen) {
      const timer = setTimeout(() => {
        if (onSuccess) onSuccess(state.client);
        onClose();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state?.message, state?.client, isOpen, onClose, onSuccess]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-0 sm:p-4">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Configure client contract</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-6 sm:p-8 space-y-6 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Channel / Client Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium" 
                placeholder="e.g. MrBeast Gaming" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="niche" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Niche</label>
              <input 
                type="text" 
                id="niche" 
                name="niche" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium" 
                placeholder="e.g. Gaming / Tech" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="channel_link" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Channel Link (URL)</label>
            <input 
              type="url" 
              id="channel_link" 
              name="channel_link" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium" 
              placeholder="https://youtube.com/@..." 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium" 
              placeholder="contact@channel.com" 
            />
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Pricing Strategy</h3>
               <select 
                  id="pricing_model" 
                  name="pricing_model" 
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 focus:outline-none"
                  defaultValue="monthly"
                  onChange={(e) => setPricingModel(e.target.value)}
                >
                  <option value="monthly">Retainer (Monthly)</option>
                  <option value="per_thumbnail">Pay Per Delivery</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="thumbnails_per_month" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deliveries / Month</label>
                <input 
                  type="number" 
                  id="thumbnails_per_month" 
                  name="thumbnails_per_month" 
                  value={thumbnailsCount}
                  onChange={(e) => setThumbnailsCount(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price_per_thumbnail" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rate / Delivery ({symbol})</label>
                <input 
                  type="number" 
                  id="price_per_thumbnail" 
                  name="price_per_thumbnail" 
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Monthly Price</p>
                  <p className="text-2xl font-black text-indigo-600 tracking-tighter">{formatCurrency(totalPrice)}</p>
               </div>
               <input 
                  type="hidden" 
                  name="monthly_price" 
                  value={totalPrice} 
               />
               <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-widest">Calculated</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{thumbnailsCount} x {pricePerUnit}</span>
               </div>
            </div>
          </div>

          {state?.message && state.message !== 'success' && (
            <p className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">{state.message}</p>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

