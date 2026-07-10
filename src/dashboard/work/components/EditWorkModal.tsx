'use client'

import { useState, useEffect, startTransition } from 'react'
import { updateWorkAction } from '@/dashboard/work/actions/work-actions'
import { getClientsAction } from '@/dashboard/clients/actions/client-actions'
import { getTeamMembersAction } from '@/dashboard/settings/actions/team-actions'
import { X, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/context/WorkspaceContext'
import { usePlan } from '@/context/PlanContext'
import { Client } from '@/types/client'
import { Work } from '@/types/work'
import { toast } from 'sonner'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'

export function EditWorkModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  task
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess?: () => void;
  task: Work;
}) {
  const [clients, setClients] = useState<Client[]>([])
  const [editors, setEditors] = useState<any[]>([])
  const [reviewers, setReviewers] = useState<any[]>([])
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { terms, workspaceType } = useWorkspace()
  const isCorporate = workspaceType === 'corporate'
  const { plan } = usePlan()
  const isAgency = plan === 'agency'

  // Form State
  const [title, setTitle] = useState(task.title || '')
  const [client, setClient] = useState(task.client || '')
  const [description, setDescription] = useState(task.description || '')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState(task.priority || 'Normal')
  const [status, setStatus] = useState(task.status || 'To Do')
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '')
  const [videoLink, setVideoLink] = useState(task.videoLink || '')
  const [reviewerId, setReviewerId] = useState((task as any).reviewerId || '')

  useEffect(() => {
    // Format deadline date to YYYY-MM-DD
    if (task.deadline) {
      try {
        const d = new Date(task.deadline)
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          setDeadline(`${y}-${m}-${day}`)
        } else {
          setDeadline(task.deadline)
        }
      } catch {
        setDeadline(task.deadline)
      }
    }
    setVideoLink(task.videoLink || '')
    setReviewerId((task as any).reviewerId || '')
  }, [task])

  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const data = await getClientsAction();
        setClients(data);
      }
      loadClients();

      if (isAgency || isCorporate) {
        async function loadTeam() {
          try {
            const data = await getTeamMembersAction();
            const staffList = isCorporate 
              ? data.filter((m: any) => m.teamRole !== 'owner')
              : data.filter((m: any) => m.teamRole === 'editor' || m.teamRole === 'admin');
            setEditors(staffList);

            const revList = data.filter((m: any) => m.teamRole !== 'viewer');
            setReviewers(revList);
          } catch (e) {
            console.error("Failed to load team members:", e);
          }
        }
        loadTeam();
      }
    }
  }, [isOpen, isAgency, isCorporate]);

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMsg('')

    const updatedData = {
      title,
      client,
      description,
      deadline,
      priority,
      status,
      assignedTo: assignedTo || null, // Save empty select as null
      reviewerId: reviewerId || null,
      videoLink: videoLink || ''
    }

    startTransition(async () => {
      try {
        const res = await updateWorkAction(task.id, updatedData)
        if (res?.message === 'success') {
          toast.success("Task updated successfully")
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setErrorMsg(res?.message || 'Failed to update task')
        }
      } catch (err) {
        console.error("Error updating task:", err)
        setErrorMsg('Database Error occurred')
      } finally {
        setIsPending(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-card-border animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-10 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Task Details</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
              <Info className="h-3 w-3" />
              Update project deliverable configurations
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="edit-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input 
                type="text" 
                id="edit-title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-6 py-4 bg-slate-55 border border-slate-200 rounded-2xl text-sm text-slate-905 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold" 
                placeholder={`e.g. ${terms.placeholderTask}`} 
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="edit-client" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isCorporate ? "Department / Project" : "Assign Client"}
              </label>
              {isCorporate ? (
                <input 
                  type="text" 
                  id="edit-client" 
                  name="client"
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold"
                  placeholder="e.g. HR, Sales, Internal..."
                />
              ) : (
                <CustomSelect 
                  id="edit-client" 
                  value={client}
                  onChange={setClient}
                  placeholder="Select Client"
                  options={clients.map(c => ({ value: c.name, label: c.name }))}
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="edit-description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief / Description</label>
            <textarea 
              id="edit-description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold min-h-[100px] resize-y" 
              placeholder="Detailed instructions for this task..."
            />
          </div>

          {!isCorporate && (
            <div className="space-y-3">
              <label htmlFor="edit-videoLink" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video / Footage Link</label>
              <input 
                type="url" 
                id="edit-videoLink" 
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder-slate-400 font-bold" 
                placeholder="e.g. Google Drive link, Dropbox, Frame.io footage link..." 
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="edit-deadline" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
              <CustomDatePicker
                value={deadline}
                onChange={setDeadline}
                name="deadline"
                required={true}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="edit-priority" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
              <CustomSelect 
                id="edit-priority" 
                value={priority}
                onChange={(val) => setPriority(val as any)}
                options={[
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Urgent', label: 'Urgent 🔥' },
                  { value: 'High', label: 'High' },
                  { value: 'Low', label: 'Low' },
                ]}
              />
            </div>
          </div>
 
          <div className={cn("grid grid-cols-1 gap-8", (isAgency || isCorporate) ? "md:grid-cols-2" : "w-full")}>
            <div className="space-y-3">
               <label htmlFor="edit-status" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Status</label>
               <CustomSelect 
                 id="edit-status" 
                 value={status}
                 onChange={(val) => setStatus(val as any)}
                 options={[
                   { value: 'To Do', label: 'To Do' },
                   { value: 'In Progress', label: 'In Progress' },
                   { value: 'Review', label: 'Review' },
                   { value: 'Completed', label: 'Completed' },
                 ]}
               />
            </div>

            {(isAgency || isCorporate) && (
              <div className="space-y-3">
                <label htmlFor="edit-assignedTo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {isCorporate ? "Assign Staff / Member" : "Assign Editor"}
                </label>
                <CustomSelect 
                  id="edit-assignedTo" 
                  value={assignedTo}
                  onChange={setAssignedTo}
                  placeholder="Unassigned"
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...editors.map(editor => ({ value: editor.id, label: `${editor.name} (${editor.teamRole || 'owner'})` }))
                  ]}
                />
              </div>
            )}
          </div>

          {isCorporate && (
            <div className="space-y-3">
              <label htmlFor="edit-reviewerId" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designated Reviewer</label>
              <CustomSelect 
                id="edit-reviewerId" 
                value={reviewerId}
                onChange={setReviewerId}
                placeholder="Select Reviewer"
                options={[
                  { value: '', label: 'None (Default Workspace Owner)' },
                  ...reviewers.map(rev => ({ value: rev.id, label: `${rev.name} (${rev.teamRole || 'owner'})` }))
                ]}
              />
              <p className="text-[9px] text-slate-400 font-semibold italic ml-1">
                Only the designated reviewer or manager can mark this task as completed.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-[1.5rem] text-[10px] text-red-600 font-bold uppercase tracking-wider animate-in shake-1 duration-300">
               {errorMsg}
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-3 bg-indigo-600 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Task Node"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
