'use client'

import { useActionState, useState, useEffect } from 'react'
import { createClientAction } from '@/dashboard/clients/client-actions'
import { Loader2, Trash2, Settings } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { Client } from '@/types/client'
import { RadixDialog, RadixSelect } from '@/components/ui/RadixAnimate'
import { getCurrentUserAction } from '@/auth/actions/auth-actions'
import { getPredefinedPlansAction, addPredefinedPlanAction, deletePredefinedPlanAction } from '@/dashboard/clients/actions/plan-actions'
import { toast } from 'sonner'

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
  
  const [predefinedPlans, setPredefinedPlans] = useState<any[]>([])
  const [bulkPackage, setBulkPackage] = useState<string>('')
  const [showManagePlans, setShowManagePlans] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanCount, setNewPlanCount] = useState(10)
  const [newPlanPrice, setNewPlanPrice] = useState(300)
  const [isMutatingPlan, setIsMutatingPlan] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (state) {
        Object.assign(state, { message: '', client: undefined, errors: {} });
      }
    }
  }

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

  async function loadPlans() {
    const res = await getPredefinedPlansAction();
    setPredefinedPlans(res);
    if (res.length > 0 && (!bulkPackage || !res.some(p => p.id === bulkPackage))) {
      setBulkPackage(res[0].id);
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const handleAddPlan = async () => {
    if (!newPlanName) {
      toast.error("Please enter a plan name.");
      return;
    }
    setIsMutatingPlan(true);
    const res = await addPredefinedPlanAction(newPlanName, newPlanCount, newPlanPrice);
    if (res.success) {
      toast.success(res.message);
      setNewPlanName('');
      await loadPlans();
    } else {
      toast.error(res.message);
    }
    setIsMutatingPlan(false);
  };

  const handleDeletePlan = async (id: string) => {
    setIsMutatingPlan(true);
    const res = await deletePredefinedPlanAction(id);
    if (res.success) {
      toast.success(res.message);
      await loadPlans();
    } else {
      toast.error(res.message);
    }
    setIsMutatingPlan(false);
  };

  // Auto-calculate rates based on selected package
  useEffect(() => {
    if (pricingModel === 'bulk_package' && bulkPackage && predefinedPlans.length > 0) {
      const selected = predefinedPlans.find(p => p.id === bulkPackage);
      if (selected) {
        setThumbnailsCount(selected.thumbnailsCount);
        setPricePerUnit(selected.pricePerUnit);
      }
    }
  }, [pricingModel, bulkPackage, predefinedPlans]);

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
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Predefined Plan</label>
                <button
                  type="button"
                  onClick={() => setShowManagePlans(!showManagePlans)}
                  className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider focus:outline-none cursor-pointer flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  {showManagePlans ? "Hide Management" : "Manage Plans"}
                </button>
              </div>
              <RadixSelect
                value={bulkPackage}
                onValueChange={setBulkPackage}
                options={predefinedPlans.map(p => ({ value: p.id, label: p.name }))}
                className="!px-4 !py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 w-full"
              />

              {showManagePlans && (
                <div className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="space-y-2.5 max-h-40 overflow-y-auto">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">Manage Custom Plans</p>
                    {predefinedPlans.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{p.name}</span>
                        <button
                          type="button"
                          onClick={() => setPlanToDelete(p.id)}
                          disabled={isMutatingPlan}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Create New Plan</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Plan Name (e.g. 7-10 Thumbnails)"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl text-xs font-bold bg-white text-slate-900 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Count</label>
                          <input
                            type="number"
                            value={newPlanCount}
                            onChange={(e) => setNewPlanCount(Number(e.target.value))}
                            className="w-full px-4 py-2 border rounded-xl text-xs font-bold bg-white text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Rate (₹)</label>
                          <input
                            type="number"
                            value={newPlanPrice}
                            onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                            className="w-full px-4 py-2 border rounded-xl text-xs font-bold bg-white text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPlan}
                        disabled={isMutatingPlan}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        ➕ Add Predefined Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

      {planToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-200/50 animate-in zoom-in-95 duration-200 text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center font-bold text-lg select-none">
              ⚠️
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Confirm Deletion</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                Are you sure you want to delete this predefined plan? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-3 bg-slate-50 text-slate-500 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = planToDelete;
                  setPlanToDelete(null);
                  handleDeletePlan(id);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </RadixDialog>
  )
}

