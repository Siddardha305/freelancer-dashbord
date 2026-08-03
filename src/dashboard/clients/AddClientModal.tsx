'use client'

import { useActionState, useState, useEffect } from 'react'
import { createClientAction } from '@/dashboard/clients/client-actions'
import { Loader2 } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { Client } from '@/types/client'
import { RadixDialog, RadixSelect } from '@/components/ui/RadixAnimate'
import { getCurrentUserAction } from '@/auth/actions/auth-actions'

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
  const { terms } = useWorkspace();
  const [state, formAction, isPending] = useActionState(
    createClientAction as (state: FormState, formData: FormData) => Promise<FormState>,
    initialState
  )
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [thumbnailsCount, setThumbnailsCount] = useState(0)
  const [pricePerUnit, setPricePerUnit] = useState(400)
  const [pricingModel, setPricingModel] = useState('monthly')
  const [bulkPackage, setBulkPackage] = useState<'pkg_7_10' | 'pkg_12_15' | 'pkg_17_20'>('pkg_7_10')

  // Fetch logged in user to check if they are the special admin account
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load current user in AddClientModal:", err);
      }
    }
    loadUser();
  }, []);

  // Auto-calculate rates based on selected package
  useEffect(() => {
    if (pricingModel === 'bulk_package') {
      if (bulkPackage === 'pkg_7_10') {
        setThumbnailsCount(10);
        setPricePerUnit(310);
      } else if (bulkPackage === 'pkg_12_15') {
        setThumbnailsCount(15);
        setPricePerUnit(320);
      } else if (bulkPackage === 'pkg_17_20') {
        setThumbnailsCount(20);
        setPricePerUnit(290);
      }
    }
  }, [pricingModel, bulkPackage]);

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

  return (
    <RadixDialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Client" 
      description="Configure client contract"
    >
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
             <RadixSelect 
                name="pricing_model" 
                value={pricingModel}
                onValueChange={setPricingModel}
                options={[
                  { value: 'monthly', label: 'Retainer (Monthly)' },
                  { value: 'per_thumbnail', label: terms.perUnitText },
                  { value: 'bulk_package', label: 'Bulk Package' }
                ]}
                className="!px-3 !py-1.5 bg-white rounded-xl text-[10px] font-bold text-slate-650 focus:ring-0 focus:border-slate-200 w-auto"
              />
          </div>

          {pricingModel === 'bulk_package' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Predefined Plan</label>
              <RadixSelect
                value={bulkPackage}
                onValueChange={(val) => setBulkPackage(val as any)}
                options={[
                  { value: 'pkg_7_10', label: '7-10 Thumbnails per month (₹3,100)' },
                  { value: 'pkg_12_15', label: '12-15 Thumbnails per month (₹4,800)' },
                  { value: 'pkg_17_20', label: '17-20 Thumbnails per month (₹5,800)' }
                ]}
                className="!px-4 !py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="thumbnails_per_month" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{terms.plural} / Month</label>
              <input 
                type="number" 
                id="thumbnails_per_month" 
                name="thumbnails_per_month" 
                value={thumbnailsCount}
                onChange={(e) => setThumbnailsCount(Number(e.target.value))}
                readOnly={pricingModel === 'bulk_package'}
                className={`w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold ${pricingModel === 'bulk_package' ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}`} 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price_per_thumbnail" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rate / {terms.singular} ({symbol})</label>
              <input 
                type="number" 
                id="price_per_thumbnail" 
                name="price_per_thumbnail" 
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                readOnly={pricingModel === 'bulk_package'}
                className={`w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold ${pricingModel === 'bulk_package' ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}`} 
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
    </RadixDialog>
  )
}

