import React from 'react';
import crypto from 'crypto';
import dbConnect from '@/database/mongodb';
import Client from '@/database/models/Client';
import Work from '@/database/models/Work';
import Payment from '@/database/models/Payment';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  ClipboardList
} from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/shared/AnimatedThemeToggler';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { clientSlug: string };
  searchParams: { token?: string };
}

export default async function ClientPortalPage({ params, searchParams }: PageProps) {
  const { clientSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  await dbConnect();

  // Retrieve client by portal slug
  const client = await Client.findOne({ portalSlug: clientSlug });

  // Constant-time token comparison to prevent timing attacks
  const isTokenValid = (() => {
    if (!client?.portalToken || !token) return false;
    try {
      const a = Buffer.from(client.portalToken, 'utf8');
      const b = Buffer.from(token as string, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  })();

  // Access validation: check portal activity status and secure token match
  if (!client || !client.portalActive || !isTokenValid) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-300">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-none text-center space-y-6 z-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Portal Unauthorized</h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
              This access link is invalid, has expired, or portal sharing has been deactivated by the administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch deliverable active works
  const deliverables = await Work.find({ 
    client: client.name, 
    userId: client.userId 
  }).sort({ updatedAt: -1 }).lean();

  // Fetch invoices history
  const invoices = await Payment.find({ 
    client: client.name, 
    userId: client.userId 
  }).sort({ invoiceDate: -1 }).lean();

  const formatCurrency = (val: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Quotas calculations
  const totalDeliverablesCount = deliverables.length;
  const completedDeliverables = deliverables.filter(d => d.status === 'Completed' || d.status === 'Done');
  const completedCount = completedDeliverables.length;
  const pendingCount = totalDeliverablesCount - completedCount;

  // Strict sanitization: only allow valid 6-digit hex colors to prevent CSS injection
  const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
  const primaryColor = HEX_COLOR_REGEX.test(client.portalPrimaryColor || '') 
    ? client.portalPrimaryColor 
    : '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 pb-20 transition-colors duration-300">
      {/* Brand styling variables injection */}
      {/* NOSONAR: primaryColor is strictly validated as a hex code, so it is safe to inject here */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --portal-theme: ${primaryColor};
          --portal-theme-rgb: ${hexToRgb(primaryColor)};
        }
      `}} />

      {/* Portal Header Nav */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 px-6 lg:px-12 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo / Brand Title */}
          <div className="flex items-center gap-3">
            {client.portalLogoUrl ? (
              <div className="h-9 w-24 flex items-center justify-center overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={client.portalLogoUrl} alt={client.name} className="h-full w-full object-contain object-left" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm text-white shadow-md bg-[var(--portal-theme)]">
                  {client.name.charAt(0)}
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate max-w-[150px] sm:max-w-none">
                  {client.name}
                </span>
              </div>
            )}

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-full uppercase tracking-wider">
              Client Portal
            </span>
          </div>

          {/* Secure indicators and Theme Toggler */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850">
              <ShieldCheck className="h-4 w-4 text-[var(--portal-theme)]" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Secure Client Access</span>
            </div>
            <AnimatedThemeToggler className="h-9 w-9 p-2" />
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 space-y-10">
        
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-sm dark:shadow-none relative overflow-hidden transition-all duration-300">
          {/* Dynamic background accent element based on custom primary color */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[rgba(var(--portal-theme-rgb),0.03)] to-transparent pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-[var(--portal-theme)]" />

          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Workspace Workspace Console</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Welcome to your Project Space</h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">
              Track deliverables, inspect finished creative assets, and audit historical invoices instantly. All data is updated live from our system.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm dark:shadow-none flex items-center justify-between group transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Total Deliverables</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {totalDeliverablesCount}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Jobs registered</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ClipboardList className="h-5 w-5 text-[var(--portal-theme)]" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm dark:shadow-none flex items-center justify-between group transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest block">Completed Tasks</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight text-emerald-600 dark:text-emerald-450">
                {completedCount}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Successfully dispatched</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm dark:shadow-none flex items-center justify-between group transition-all duration-300">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest block">Active Pipeline</span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight text-amber-600 dark:text-amber-450">
                {pendingCount}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Currently in progress</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-5 w-5 text-amber-550" />
            </div>
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm dark:shadow-none overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[var(--portal-theme)]" /> Project Deliverables
            </h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Summary of deliverables, active tasks, and assets links</p>
          </div>

          <div className="overflow-x-auto">
            {deliverables.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-950/30 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/80">
                    <th className="py-4 px-6">Task Title & Details</th>
                    <th className="py-4 px-6">Deadline</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right pr-8">Assets / Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {deliverables.map((work) => (
                    <tr key={String(work._id)} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/15 transition-colors duration-250">
                      <td className="py-5 px-6">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{work.title}</p>
                          {work.description && (
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 max-w-md leading-relaxed">{work.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {work.deadline ? formatDate(work.deadline) : 'No deadline'}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          work.priority === 'Urgent' || work.priority === 'High'
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {work.priority}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${
                          work.status === 'Completed' || work.status === 'Done'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450'
                            : work.status === 'In Progress'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-450'
                            : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400'
                        }`}>
                          {work.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right pr-8">
                        {work.attachments && work.attachments.length > 0 ? (
                          <div className="flex justify-end gap-2">
                            {work.attachments.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-[var(--portal-theme)] dark:hover:bg-[var(--portal-theme)] hover:text-white dark:hover:text-white text-slate-655 dark:text-slate-355 hover:border-transparent dark:hover:border-transparent rounded-lg text-[10px] font-bold transition-all"
                                title="Download Attachment"
                              >
                                <Download className="h-3.5 w-3.5" /> File {work.attachments.length > 1 ? idx + 1 : ''}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-350 dark:text-slate-600">No assets uploaded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-450">No deliverables assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Invoices & Billing Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm dark:shadow-none overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--portal-theme)]" /> Billing & Payment History
            </h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Historical ledger of issued invoices, billing quotas, and transaction slips</p>
          </div>

          <div className="overflow-x-auto">
            {invoices.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-950/30 text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/80">
                    <th className="py-4 px-6">Invoice Number</th>
                    <th className="py-4 px-6">Billing Amount</th>
                    <th className="py-4 px-6">Invoice Date</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Payment Method</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right pr-8">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {invoices.map((inv) => (
                    <tr key={String(inv._id)} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/15 transition-colors duration-250">
                      <td className="py-5 px-6 font-mono font-bold text-xs text-slate-700 dark:text-slate-350">
                        {inv.invoiceNumber || `INV-${String(inv._id).substring(18).toUpperCase()}`}
                      </td>
                      <td className="py-5 px-6 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(Number(inv.amount), inv.currency)}
                      </td>
                      <td className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {inv.invoiceDate ? formatDate(inv.invoiceDate) : 'N/A'}
                      </td>
                      <td className="py-5 px-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {inv.dueDate ? formatDate(inv.dueDate) : (inv.due_date || 'N/A')}
                      </td>
                      <td className="py-5 px-6 text-xs font-bold text-slate-655 dark:text-slate-400">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450'
                            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-450'
                        }`}>
                          <div className={`w-1 h-1 rounded-full shrink-0 ${inv.payment_status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {inv.payment_status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right pr-8">
                        {inv.receiptUrl ? (
                          <a
                            href={inv.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-[var(--portal-theme)] dark:hover:bg-[var(--portal-theme)] hover:text-white dark:hover:text-white text-slate-650 dark:text-slate-350 hover:border-transparent dark:hover:border-transparent rounded-lg text-[10px] font-bold transition-all"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Receipt
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-355 dark:text-slate-600">No receipt issued</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <CreditCard className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-450">No billing history found</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

// Color conversion helper for translucent overlays
function hexToRgb(hex: string): string {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return '79, 70, 229'; // Default indigo rgb fallback
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
