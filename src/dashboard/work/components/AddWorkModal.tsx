'use client'

import { useActionState, useEffect, useState } from 'react'
import { createWorkAction } from '@/dashboard/work/actions/work-actions'
import { getClientsAction } from '@/dashboard/clients/actions/client-actions'
import { getTeamMembersAction } from '@/dashboard/settings/actions/team-actions'
import { X, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/context/WorkspaceContext'
import { usePlan } from '@/context/PlanContext'
import { Client } from '@/types/client'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'

const initialState = {
  message: '',
  errors: {},
}

export function AddWorkModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialDeadline
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: () => void;
  initialDeadline?: string;
}) {
  const [state, formAction, isPending] = useActionState(createWorkAction, initialState)
  const [clients, setClients] = useState<Client[]>([])
  const [editors, setEditors] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('Normal')
  const [selectedStatus, setSelectedStatus] = useState('To Do')
  const [selectedEditor, setSelectedEditor] = useState('')
  const [deadline, setDeadline] = useState('')
  const { terms } = useWorkspace()
  const { plan } = usePlan()
  const isAgency = plan === 'agency'

  useEffect(() => {
    if (isOpen) {
      setDeadline(initialDeadline || '');
    }
  }, [isOpen, initialDeadline]);

  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const data = await getClientsAction();
        setClients(data);
      }
      loadClients();

      if (isAgency) {
        async function loadEditors() {
          try {
            const data = await getTeamMembersAction();
            const list = data.filter((m: any) => m.teamRole === 'editor' || m.teamRole === 'admin');
            setEditors(list);
          } catch (e) {
            console.error("Failed to load editors:", e);
          }
        }
        loadEditors();
      }
    }
  }, [isOpen, isAgency]);

  if (!isOpen) return null

  if (state?.message === 'success') {
    if (onSuccess) onSuccess();
    onClose();
    Object.assign(state, { message: '' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-card-border animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-10 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Task</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
              <Info className="h-3 w-3" />
              Initialize project deliverable node
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold" 
                placeholder={`e.g. ${terms.placeholderTask}`} 
              />
              {state?.errors?.title && <p className="text-[10px] text-red-500 mt-1 font-bold ml-1">{state.errors.title[0]}</p>}
            </div>

            <div className="space-y-3">
              <label htmlFor="client" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Client</label>
              <CustomSelect 
                id="client" 
                name="client" 
                required
                value={selectedClient}
                onChange={setSelectedClient}
                placeholder="Select a client..."
                options={clients.map(c => ({ value: c.name, label: c.name }))}
              />
              {state?.errors?.client && <p className="text-[10px] text-red-500 mt-1 font-bold ml-1">{state.errors.client[0]}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief / Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows={3}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold resize-none" 
              placeholder="Detailed instructions for this task..." 
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="videoLink" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video / Footage Link</label>
            <input 
              type="url" 
              id="videoLink" 
              name="videoLink" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold" 
              placeholder="e.g. Google Drive link, Dropbox, Frame.io footage link..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="deadline" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
              <CustomDatePicker
                value={deadline}
                onChange={setDeadline}
                name="deadline"
                required={true}
              />
              {state?.errors?.deadline && <p className="text-[10px] text-red-500 mt-1 font-bold ml-1">{state.errors.deadline[0]}</p>}
            </div>

            <div className="space-y-3">
              <label htmlFor="priority" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
              <CustomSelect
                id="priority"
                name="priority"
                value={selectedPriority}
                onChange={setSelectedPriority}
                options={[
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Urgent', label: 'Urgent 🔥' },
                  { value: 'High', label: 'High' },
                  { value: 'Low', label: 'Low' },
                ]}
              />
            </div>
          </div>

          <div className={cn("grid grid-cols-1 gap-8", isAgency ? "md:grid-cols-2" : "w-full")}>
            <div className="space-y-3">
               <label htmlFor="status" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
               <CustomSelect
                 id="status"
                 name="status"
                 value={selectedStatus}
                 onChange={setSelectedStatus}
                 options={[
                   { value: 'To Do', label: 'To Do' },
                   { value: 'In Progress', label: 'In Progress' },
                   { value: 'Review', label: 'Review' },
                   { value: 'Completed', label: 'Completed' },
                 ]}
               />
            </div>

            {isAgency && (
              <div className="space-y-3">
                <label htmlFor="assignedTo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Editor</label>
                <CustomSelect
                  id="assignedTo"
                  name="assignedTo"
                  value={selectedEditor}
                  onChange={setSelectedEditor}
                  placeholder="Unassigned"
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...editors.map(editor => ({ value: editor.id, label: `${editor.name} (${editor.teamRole})` }))
                  ]}
                />
              </div>
            )}
          </div>

          {state?.message && state.message !== 'success' && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-[1.5rem] text-[10px] text-red-600 font-bold uppercase tracking-wider animate-in shake-1 duration-300">
               {state.message}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className={cn(
                "flex-2 flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 active:scale-95",
                isPending && "animate-pulse"
              )}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Task Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


