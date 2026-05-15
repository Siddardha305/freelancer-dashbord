'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateClientAction } from '@/features/clients/actions/client-actions'
import { X, Loader2, Save, User, Mail, Phone, Globe, Clock, Tag, FileText, Calendar, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EditClientModal({ 
  isOpen, 
  onClose, 
  client,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: any;
  onSuccess?: (updatedClient: any) => void 
}) {
  const [pricingModel, setPricingModel] = useState(client.pricing_model || 'monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !client) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: any = {}
    formData.forEach((value, key) => {
      if (key === 'tags') {
        data[key] = (value as string).split(',').map(t => t.trim()).filter(t => t)
      } else {
        data[key] = value
      }
    })

    try {
      const result = await updateClientAction(client.id, data)
      if (result.message === 'success') {
        if (onSuccess) onSuccess(result.client)
        onClose()
      } else {
        setError(result.message || 'Failed to update client')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Client Profile</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Update information for {client.name}</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
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
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
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
                 <select 
                    name="status" 
                    defaultValue={client.status}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <select 
                    name="priority" 
                    defaultValue={client.priority}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pricing Model</label>
                <select 
                  name="pricing_model" 
                  defaultValue={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold"
                >
                  <option value="monthly">Retainer (Monthly)</option>
                  <option value="per_thumbnail">Pay Per Delivery</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rate / Price (₹)</label>
                <input 
                  type="number" 
                  name="monthly_price" 
                  defaultValue={client.monthly_price}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold" 
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
              <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
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
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => (document.querySelector('form') as any).requestSubmit()}
            disabled={loading} 
            className="flex-2 flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
