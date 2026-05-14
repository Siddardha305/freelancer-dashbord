'use client'

import { useActionState, useEffect, useState } from 'react'
import { createWorkAction } from '@/features/work/actions/work-actions'
import { getClientsAction } from '@/features/clients/actions/client-actions'
import { X, Loader2 } from 'lucide-react'

const initialState = {
  message: '',
  errors: {},
}

export function AddWorkModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [state, formAction, isPending] = useActionState(createWorkAction, initialState)
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const data = await getClientsAction();
        setClients(data);
      }
      loadClients();
    }
  }, [isOpen]);

  if (!isOpen) return null

  if (state?.message === 'success') {
    if (onSuccess) onSuccess();
    onClose();
    state.message = ''; 
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Task</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Initialize project node</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 font-medium" 
              placeholder="e.g. GTA 5 Mod Thumbnail" 
            />
            {state?.errors?.title && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="client" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Client</label>
            <select 
              id="client" 
              name="client" 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium appearance-none"
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.name}>{client.name}</option>
              ))}
            </select>
            {state?.errors?.client && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.client[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
            <input 
              type="text" 
              id="deadline" 
              name="deadline" 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 font-medium" 
              placeholder="e.g. Tomorrow, 5:00 PM" 
            />
            {state?.errors?.deadline && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.deadline[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
              <select id="status" name="status" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium appearance-none">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Priority</label>
              <select id="priority" name="priority" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium appearance-none">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {state?.message && state.message !== 'success' && (
            <p className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">{state.message}</p>
          )}

          <div className="pt-4 flex gap-3">
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
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

