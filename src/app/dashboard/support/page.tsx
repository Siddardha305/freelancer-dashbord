'use client'

import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { LifeBuoy, Send, Loader2, Sparkles, MessageCircle, AlertCircle, Calendar } from "lucide-react";
import { createSupportTicketAction, getSupportTicketsForUserAction } from "@/dashboard/support/actions/support-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { SupportTicket } from "@/types/support";

export default function SupportPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: tickets = [], isLoading: loadingTickets, refetch: refetchTickets } = useQuery<SupportTicket[]>({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const data = await getSupportTicketsForUserAction();
      return data as SupportTicket[];
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a ticket summary title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your support issue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSupportTicketAction({
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
      });

      if (res.success) {
        toast.success(res.message);
        setTitle("");
        setDescription("");
        setCategory("technical");
        setPriority("medium");
        // Reload list
        refetchTickets();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to raise support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
      <PageHeader title="Help & Support" description="Submit queries and view response logs from system administrators" />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-4xl space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Create Ticket Form */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Raise a New Ticket</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-555 font-medium">Briefly outline your technical or billing inquiry below.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ticket Title / Summary</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all"
                    placeholder="e.g. Invoice template layout issues or billing adjustments"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all cursor-pointer"
                    >
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Invoices</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="other">General Question</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical Issue</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Issue Details / Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/40 transition-all resize-none"
                    placeholder="Provide a detailed description of the error or feature suggestion..."
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Helper Tips */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[2rem] p-8 shadow-lg shadow-indigo-500/10 space-y-4">
                <div className="p-3 bg-white/10 w-fit rounded-2xl border border-white/15">
                  <Sparkles className="h-5 w-5 text-indigo-105" />
                </div>
                <h3 className="font-extrabold text-base tracking-tight leading-tight">24/7 Priority Resolution</h3>
                <p className="text-[11px] font-bold text-indigo-100 leading-relaxed tracking-wide uppercase">
                  Technical, billing, or plan adjustment tickets are dispatched directly to cluster administrators for verified resolution.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Support Guidelines</h4>
                <ul className="space-y-3">
                  {[
                    "Be descriptive when reporting interface or billing issues.",
                    "Expect ticket replies within 2 to 4 hours of submission.",
                    "Verify your scanner QR codes are active before submitting invoices."
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs font-semibold text-slate-500 dark:text-slate-450">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Previous Ticket Logs History */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-400">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Your Support Tickets</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">History of your raised tickets and administrative answers.</p>
              </div>
            </div>

            {loadingTickets ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading history logs...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-3 animate-in fade-in duration-300">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-150 dark:border-slate-900/60 mb-2">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">No support tickets raised yet</p>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">Raised tickets will show up here along with their status updates and responses.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tickets.map((t) => (
                  <div 
                    key={t._id || t.id} 
                    className="border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200/80 dark:hover:border-slate-750 transition-colors space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-3 py-1 rounded-full">
                          ID: #{String(t._id || t.id).slice(-6).toUpperCase()}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight mt-1">{t.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          t.status === 'open' 
                            ? 'bg-amber-55/10 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' 
                            : t.status === 'resolved'
                            ? 'bg-emerald-55/10 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                            : 'bg-indigo-55/10 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                        }`}>
                          {t.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          t.priority === 'critical' || t.priority === 'high'
                            ? 'bg-rose-55/10 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-750'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">{t.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      <span>Raised on: {format(new Date(t.createdAt), "MMMM dd, yyyy · hh:mm a")}</span>
                      <span className="mx-1.5">·</span>
                      <span className="capitalize">Category: {t.category.replace('_', ' ')}</span>
                    </div>

                    {t.adminReply && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl p-5 space-y-2 mt-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">Administrator Answer:</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold">{t.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
