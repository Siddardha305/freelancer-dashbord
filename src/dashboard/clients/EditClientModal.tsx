'use client'

import { useState, useEffect } from 'react'
import { updateClientAction } from '@/dashboard/clients/client-actions'
import { Loader2, Save, User, Mail, Phone, Globe, Clock, Tag, Link as LinkIcon, Trash2, Settings } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { Client } from '@/types/client'
import { RadixDialog, RadixSelect } from '@/components/ui/RadixAnimate'
import { getCurrentUserAction } from '@/auth/actions/auth-actions'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'
import { getPredefinedPlansAction, addPredefinedPlanAction, deletePredefinedPlanAction } from '@/dashboard/clients/actions/plan-actions'
import { toast } from 'sonner'

export function EditClientModal({ 
  isOpen, 
  onClose, 
  client,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: Client | null;
  onSuccess?: (updatedClient: Client) => void 
}) {
  const { symbol } = useCurrency();
  const { terms } = useWorkspace();
  const [pricingModel, setPricingModel] = useState(client?.pricing_model || 'monthly')
  const [status, setStatus] = useState(client?.status || 'Active')
  const [priority, setPriority] = useState(client?.priority || 'Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [thumbnailsCount, setThumbnailsCount] = useState(client?.thumbnails_per_month || 0)
  const [pricePerUnit, setPricePerUnit] = useState(client?.price_per_thumbnail || 0)
  const [monthlyPrice, setMonthlyPrice] = useState(client?.monthly_price || 0)
  const [contractStartDate, setContractStartDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')

  const [predefinedPlans, setPredefinedPlans] = useState<any[]>([])
  const [bulkPackage, setBulkPackage] = useState<string>('')
  const [showManagePlans, setShowManagePlans] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanCount, setNewPlanCount] = useState(10)
  const [newPlanPrice, setNewPlanPrice] = useState(300)
  const [isMutatingPlan, setIsMutatingPlan] = useState(false)

  // Sync client dates on load
  useEffect(() => {
    if (client) {
      setContractStartDate(client.contractStartDate ? new Date(client.contractStartDate).toISOString().split('T')[0] : '');
      setContractEndDate(client.contractEndDate ? new Date(client.contractEndDate).toISOString().split('T')[0] : '');
    }
  }, [client]);

  // Fetch logged in user to check if they are the special admin account
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load current user in EditClientModal:", err);
      }
    }
    loadUser();
  }, []);

  async function loadPlans() {
    const res = await getPredefinedPlansAction();
    setPredefinedPlans(res);
    
    const matching = res.find(p => p.thumbnailsCount === client?.thumbnails_per_month && p.pricePerUnit === client?.price_per_thumbnail);
    if (matching) {
      setBulkPackage(matching.id);
    } else if (res.length > 0 && (!bulkPackage || !res.some(p => p.id === bulkPackage))) {
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
    if (confirm("Are you sure you want to delete this predefined plan?")) {
      setIsMutatingPlan(true);
      const res = await deletePredefinedPlanAction(id);
      if (res.success) {
        toast.success(res.message);
        await loadPlans();
      } else {
        toast.error(res.message);
      }
      setIsMutatingPlan(false);
    }
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

  if (!client) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key === 'tags') {
        data[key] = (value as string).split(',').map(t => t.trim()).filter(t => t)
      } else {
        data[key] = value
      }
    })

    try {
      const result = await updateClientAction(client.id, data)
      if (result.message === 'success' && result.client) {
        if (onSuccess) onSuccess(result.client)
        onClose()
      } else {
        setError(result.message || 'Failed to update client')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RadixDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Client Profile"
      description={`Update information for ${client.name}`}
      sizeClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden max-h-[75vh]">
        {/* Form Body Scroll Area */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Basic Information Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Channel Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={client.name}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niche</label>
                <input 
                  type="text" 
                  name="niche" 
                  defaultValue={client.niche}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={client.email}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="phone" 
                    defaultValue={client.phone}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Localization Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Globe className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Localization</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  defaultValue={client.country}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="timezone" 
                    defaultValue={client.timezone}
                    className="w-full pl-12 pr-5 py-4 bg-slate-55 border border-slate-205 rounded-2xl text-sm font-bold" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contract Details Section */}
          <section className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Pricing & Status</h3>
               <div className="flex gap-2">
                 <RadixSelect 
                    name="status" 
                    value={status}
                    onValueChange={(val) => setStatus(val as any)}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "On Hold", label: "On Hold" },
                      { value: "Completed", label: "Completed" }
                    ]}
                    className="!px-3 !py-1.5 bg-white rounded-xl text-[10px] font-bold text-slate-650 focus:ring-0 focus:border-slate-200 w-auto"
                  />
                  <RadixSelect 
                    name="priority" 
                    value={priority}
                    onValueChange={(val) => setPriority(val as any)}
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" }
                    ]}
                    className="!px-3 !py-1.5 bg-white rounded-xl text-[10px] font-bold text-slate-650 focus:ring-0 focus:border-slate-200 w-auto"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pricing Model</label>
                <RadixSelect 
                  name="pricing_model" 
                  value={pricingModel}
                  onValueChange={setPricingModel}
                  options={[
                    { value: 'monthly', label: 'Retainer (Monthly)' },
                    { value: 'per_thumbnail', label: terms.perUnitText },
                    { value: 'bulk_package', label: 'Bulk Package' }
                  ]}
                  className="bg-white w-full border border-slate-200 rounded-2xl text-sm font-bold px-5 py-4"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rate / Price ({symbol})</label>
                <input 
                  type="number" 
                  name="monthly_price" 
                  value={pricingModel === 'bulk_package' ? (thumbnailsCount * pricePerUnit) : monthlyPrice}
                  onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                  readOnly={pricingModel === 'bulk_package'}
                  className={`w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold ${pricingModel === 'bulk_package' ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}`} 
                />
              </div>
            </div>

            {pricingModel === 'bulk_package' && (
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Predefined Plan</label>
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
                  className="!px-4 !py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-905 w-full"
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
                            onClick={() => handleDeletePlan(p.id)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly {terms.plural} Quota</label>
                <input 
                  type="number" 
                  name="thumbnails_per_month" 
                  value={thumbnailsCount}
                  onChange={(e) => setThumbnailsCount(Number(e.target.value))}
                  readOnly={pricingModel === 'bulk_package'}
                  className={`w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold ${pricingModel === 'bulk_package' ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}`}
                  placeholder="e.g. 8"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate Per {terms.singular} ({symbol})</label>
                <input 
                  type="number" 
                  name="price_per_thumbnail" 
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  readOnly={pricingModel === 'bulk_package'}
                  className={`w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold ${pricingModel === 'bulk_package' ? 'bg-slate-100/80 cursor-not-allowed opacity-75' : ''}`}
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Start</label>
                <CustomDatePicker
                  value={contractStartDate}
                  onChange={setContractStartDate}
                  name="contractStartDate"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract End</label>
                <CustomDatePicker
                  value={contractEndDate}
                  onChange={setContractEndDate}
                  name="contractEndDate"
                />
              </div>
            </div>
          </section>

          {/* Social & Notes Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650">
                <LinkIcon className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Additional Details</h3>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Channel URL / Social Link</label>
              <input 
                type="url" 
                name="channel_link" 
                defaultValue={client.channel_link}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags (Comma separated)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  name="tags" 
                  defaultValue={client.tags?.join(', ')}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
                  placeholder="e.g. Gaming, High-Value, US-Based"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
              <textarea 
                name="notes" 
                rows={4}
                defaultValue={client.notes}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold resize-none" 
              />
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold uppercase tracking-wider">
               {error}
            </div>
          )}
        </div>

        {/* Footer (Sticky within Modal form) */}
        <div className="p-8 border-t border-slate-100 flex gap-4 shrink-0 bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading} 
            className="flex-2 flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </RadixDialog>
  )
}
