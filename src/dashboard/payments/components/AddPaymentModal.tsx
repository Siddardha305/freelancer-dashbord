'use client'

import { useActionState, useEffect, useState } from 'react'
import { createPaymentAction } from '../actions/payment-actions'
import { getClientsAction } from '@/dashboard/clients/actions/client-actions'
import { Loader2, DollarSign, CheckCircle2, Download } from 'lucide-react'
import { FormModal } from '@/components/shared/FormModal'
import { downloadInvoice } from '@/lib/export-utils'
import { useCurrency } from '@/context/CurrencyContext'
import { format } from 'date-fns'

const initialState = {
  message: '',
  errors: {},
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialClient?: string;
  initialAmount?: number;
}

export function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialClient = '',
  initialAmount
}: AddPaymentModalProps) {
  const { symbol } = useCurrency();
  const [state, formAction, isPending] = useActionState(createPaymentAction, initialState)
  const [clients, setClients] = useState<any[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  // Prefill states
  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [amount, setAmount] = useState(initialAmount !== undefined ? String(initialAmount) : '');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const data = await getClientsAction();
        setClients(data);
      }
      loadClients();
      setShowSuccess(false);

      // Prepopulate
      setSelectedClient(initialClient || '');
      setAmount(initialAmount !== undefined ? String(initialAmount) : '');
      
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(format(defaultDate, 'MMM dd, yyyy'));
    }
  }, [isOpen, initialClient, initialAmount]);

  useEffect(() => {
    if (state?.message === 'success' && isOpen) {
      setShowSuccess(true);
      if (onSuccess) onSuccess();
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
              onClick={() => (state as any).payment && downloadInvoice((state as any).payment, symbol)}
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-6 p-2">
          <div className="space-y-2">
            <label htmlFor="client" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Client</label>
            <select 
              id="client" 
              name="client" 
              required
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
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
            <label htmlFor="amount" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount ({symbol})</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
            <input 
              type="text" 
              id="due_date" 
              name="due_date" 
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 font-medium" 
              placeholder="e.g. Oct 15, 2024" 
            />
            {state?.errors?.due_date && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{state.errors.due_date[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="payment_status" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
            <select id="payment_status" name="payment_status" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium appearance-none">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {state?.message && state.message !== 'success' && (
            <p className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">{state.message}</p>
          )}

          <div className="pt-6 flex gap-3">
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
              Save Record
            </button>
          </div>
        </form>
      )}
    </FormModal>
  )
}

