'use client'

import { useState, useEffect } from 'react'
import { updateClientAction } from '@/dashboard/clients/actions/client-actions'
import { Loader2, Save, User, Mail, Phone, Globe, Clock, Tag, Link as LinkIcon } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { Client } from '@/types/client'
import { RadixDialog, RadixSelect } from '@/components/ui/RadixAnimate'
import { getCurrentUserAction } from '@/auth/actions/auth-actions'

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

  // Determine initial package if edit has bulk model
  const getInitialPackage = () => {
    if (client?.pricing_model === 'bulk_package') {
      if (client.thumbnails_per_month === 10) return 'pkg_7_10';
      if (client.thumbnails_per_month === 15) return 'pkg_12_15';
      if (client.thumbnails_per_month === 20) return 'pkg_17_20';
    }
    return 'pkg_7_10';
  };
  const [bulkPackage, setBulkPackage] = useState<'pkg_7_10' | 'pkg_12_15' | 'pkg_17_20'>(getInitialPackage())

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
                    onValueChange={setStatus}
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
                    onValueChange={setPriority}
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
                  options={
                    currentUser?.email === 'siddardhachitturi789@gmail.com'
                      ? [
                          { value: 'bulk_package', label: 'Bulk Package' },
                          { value: 'per_thumbnail', label: terms.perUnitText }
                        ]
                      : [
                          { value: 'monthly', label: 'Retainer (Monthly)' },
                          { value: 'per_thumbnail', label: terms.perUnitText },
                          { value: 'bulk_package', label: 'Bulk Package' }
                        ]
                  }
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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Predefined Plan</label>
                <RadixSelect
                  value={bulkPackage}
                  onValueChange={(val) => setBulkPackage(val as any)}
                  options={[
                    { value: 'pkg_7_10', label: '7-10 Thumbnails per month (₹3,100)' },
                    { value: 'pkg_12_15', label: '12-15 Thumbnails per month (₹4,800)' },
                    { value: 'pkg_17_20', label: '17-20 Thumbnails per month (₹5,800)' }
                  ]}
                  className="bg-white w-full border border-slate-200 rounded-2xl text-sm font-bold px-5 py-4"
                />
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
                <input 
                  type="date" 
                  name="contractStartDate" 
                  defaultValue={client.contractStartDate ? new Date(client.contractStartDate).toISOString().split('T')[0] : ''}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract End</label>
                <input 
                  type="date" 
                  name="contractEndDate" 
                  defaultValue={client.contractEndDate ? new Date(client.contractEndDate).toISOString().split('T')[0] : ''}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold" 
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
