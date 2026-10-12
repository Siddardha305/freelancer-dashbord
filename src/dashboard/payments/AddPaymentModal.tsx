'use client'

import { useActionState, useEffect, useState } from 'react'
import { createPaymentAction } from '@/dashboard/payments/payment-actions'
import { getClientsAction } from '@/dashboard/clients/client-actions'
import { getWorksAction } from '@/dashboard/work/actions/work-actions'
import { getCurrentUserAction } from '@/auth/actions/auth-actions'
import { downloadInvoice, resolveLineItemsForInvoice } from '@/lib/export-utils'
import { FormModal } from '@/components/shared/FormModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { CustomDatePicker } from '@/components/ui/CustomDatePicker'
import { useCurrency } from '@/context/CurrencyContext'
import { CheckCircle2, Download, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Client } from '@/types/client'
import { Work } from '@/types/work'

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialClient?: string;
  initialAmount?: number;
  clients?: Client[];
  works?: Work[];
  currentUser?: { agencyName?: string; agencyLogoUrl?: string; agencyLogoDarkUrl?: string; agencyScannerUrl?: string; agencyBrandingMode?: "logo" | "text" | "both" } | null;
}

export function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialClient,
  initialAmount,
  clients: propClients,
  works: propWorks,
  currentUser: propUser
}: AddPaymentModalProps) {
  const [state, formAction, isPending] = useActionState(createPaymentAction, null)
  const [selectedClient, setSelectedClient] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [dueDate, setDueDate] = useState('')
  const [clients, setClients] = useState<Client[]>(propClients || [])
  const [works, setWorks] = useState<Work[]>(propWorks || [])
  const [currentUser, setCurrentUser] = useState<{ agencyName?: string; agencyLogoUrl?: string; agencyScannerUrl?: string; agencyBrandingMode?: "logo" | "text" | "both" } | null>(propUser || null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { symbol } = useCurrency()

  // Sync prop changes
  useEffect(() => {
    if (propClients && propClients.length > 0) setClients(propClients);
  }, [propClients]);

  useEffect(() => {
    if (propWorks && propWorks.length > 0) setWorks(propWorks);
  }, [propWorks]);

  useEffect(() => {
    if (propUser) setCurrentUser(propUser);
  }, [propUser]);

  useEffect(() => {
    if (initialClient !== undefined) setSelectedClient(initialClient);
  }, [initialClient]);

  useEffect(() => {
    if (initialAmount !== undefined) setAmount(String(initialAmount));
  }, [initialAmount]);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      async function loadClientsAndUser() {
        try {
          if (!propClients || propClients.length === 0) {
            const clientData = await getClientsAction();
            setClients(clientData);
          }
          if (!propUser) {
            const user = await getCurrentUserAction();
            setCurrentUser(user);
          }
          if (!propWorks || propWorks.length === 0) {
            const worksData = await getWorksAction();
            setWorks(worksData);
          }
        } catch (e) {
          console.error("Failed to load user branding details:", e);
        }
      }
      loadClientsAndUser();

      const timer = setTimeout(() => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setDueDate(format(defaultDate, 'yyyy-MM-dd'));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, propClients, propUser, propWorks]);

  useEffect(() => {
    if (state?.message === 'success' && isOpen) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
        if (onSuccess) onSuccess();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state?.message, isOpen, onSuccess]);

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={showSuccess ? "Invoice Created" : "Create Invoice"}>
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Success!</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Record saved successfully</p>
          </div>
          
          <div className="w-full flex flex-col gap-3 px-2">
            <button 
              onClick={() => {
                if (!state?.payment) return;

                const lineItems = resolveLineItemsForInvoice(state.payment, clients, works);

                const clientObj = clients.find(c => (c.name || '').trim().toLowerCase() === (selectedClient || '').trim().toLowerCase());
                const quota = clientObj?.thumbnails_per_month || 8;
                const ratePerTask = clientObj?.price_per_thumbnail && clientObj.price_per_thumbnail > 0
                  ? clientObj.price_per_thumbnail
                  : (quota > 0 && clientObj?.monthly_price ? Number(clientObj.monthly_price) / quota : 0);

                downloadInvoice(
                  state.payment, 
                  symbol,
                  currentUser?.agencyName,
                  currentUser?.agencyLogoUrl,
                  currentUser?.agencyBrandingMode || "both",
                  lineItems,
                  ratePerTask,
                  currentUser?.agencyScannerUrl,
                  clients,
                  works
                );
              }}
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-6 p-2">
          <div className="space-y-2">
            <label htmlFor="client" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Client</label>
            <CustomSelect 
              id="client" 
              name="client" 
              required
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder="Select a client..."
              options={Array.from(new Set(clients.map(c => c.name).filter(Boolean))).map(name => ({ value: name, label: name }))}
            />
            {state?.errors?.client && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.client[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount ({symbol})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 w-4 h-4 flex items-center justify-center select-none leading-none">{symbol}</span>
              <input 
                type="number" 
                id="amount" 
                name="amount" 
                step="0.01" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold" 
                placeholder="0.00" 
              />
            </div>
            {state?.errors?.amount && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.amount[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="due_date" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
            <CustomDatePicker
              value={dueDate}
              onChange={setDueDate}
              name="due_date"
              required={true}
            />
            {state?.errors?.due_date && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.due_date[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="payment_status" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
            <CustomSelect
              id="payment_status"
              name="payment_status"
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Overdue', label: 'Overdue' }
              ]}
            />
          </div>

          {state?.message && state.message !== 'success' && (
            <p className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">{state.message}</p>
          )}

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 cursor-pointer"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Record
            </button>
          </div>
        </form>
      )}
    </FormModal>
  )
}
