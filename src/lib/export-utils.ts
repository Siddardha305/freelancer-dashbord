import { Payment } from '@/types/payment';
import { Client } from '@/types/client';
import { Work } from '@/types/work';

export interface InvoiceLineItem {
  title: string;
  type?: string;
  date?: string;
  rate?: number;
  quantity?: number;
  amount: number;
}

/**
 * Resolves itemized product and deliverable history for an invoice.
 * Intelligently matches client work history, delivery dates, and unit rates.
 */
export function resolveLineItemsForInvoice(
  payment: Payment,
  clients: Client[] = [],
  works: Work[] = []
): InvoiceLineItem[] {
  if (!payment || !payment.client) return [];

  const clientNameNorm = (payment.client || '').trim().toLowerCase();
  const clientObj = clients.find(c => (c.name || '').trim().toLowerCase() === clientNameNorm);

  const totalAmount = Number(payment.amount) || 0;
  const quota = clientObj?.thumbnails_per_month || 8;
  const ratePerTask = clientObj?.price_per_thumbnail && clientObj.price_per_thumbnail > 0
    ? clientObj.price_per_thumbnail
    : (quota > 0 && clientObj?.monthly_price ? Number(clientObj.monthly_price) / quota : 0);

  const expectedQty = ratePerTask > 0 ? Math.max(1, Math.round(totalAmount / ratePerTask)) : (quota || 1);

  // All works for this client
  const clientWorks = works.filter(w => (w.client || '').trim().toLowerCase() === clientNameNorm);

  // Completed / Done works
  const completedWorks = clientWorks.filter(w => {
    const s = (w.status || '').toString().toLowerCase();
    return s === 'completed' || s === 'done';
  });

  const dateVal = payment.invoiceDate || payment.createdAt;
  const invDate = dateVal ? new Date(dateVal) : new Date();
  const start = new Date(invDate.getFullYear(), invDate.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(invDate.getFullYear(), invDate.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Try matching within the exact invoice month
  let selectedTasks = completedWorks.filter(w => {
    const dStr = w.completedAt || w.deadline || w.updatedAt || w.createdAt;
    if (!dStr) return false;
    const d = new Date(dStr);
    return d >= start && d <= end;
  });

  // 2. If no tasks in this month, look at tasks completed in the preceding 60 days
  if (selectedTasks.length === 0) {
    const lookbackStart = new Date(invDate.getTime() - 60 * 24 * 60 * 60 * 1000);
    selectedTasks = completedWorks.filter(w => {
      const dStr = w.completedAt || w.deadline || w.updatedAt || w.createdAt;
      if (!dStr) return false;
      const d = new Date(dStr);
      return d >= lookbackStart && d <= end;
    });
  }

  // 3. If still empty, use all completed works for this client
  if (selectedTasks.length === 0 && completedWorks.length > 0) {
    selectedTasks = [...completedWorks];
  }

  // 4. If still empty, check if there are any client works at all
  if (selectedTasks.length === 0 && clientWorks.length > 0) {
    selectedTasks = [...clientWorks];
  }

  // Sort chronologically
  selectedTasks.sort((a, b) => {
    const da = new Date(a.completedAt || a.deadline || a.createdAt || 0).getTime();
    const db = new Date(b.completedAt || b.deadline || b.createdAt || 0).getTime();
    return da - db;
  });

  // If we have more tasks than expectedQty (and expectedQty > 0), take the most recent N matching expectedQty
  if (expectedQty > 0 && selectedTasks.length > expectedQty) {
    selectedTasks = selectedTasks.slice(-expectedQty);
  }

  if (selectedTasks.length > 0) {
    const unitRate = ratePerTask > 0 
      ? ratePerTask 
      : (totalAmount > 0 ? Math.round(totalAmount / selectedTasks.length) : 0);

    return selectedTasks.map(w => {
      const dStr = w.completedAt || w.deadline || w.createdAt;
      let formattedDate: string | undefined = undefined;
      if (dStr) {
        try {
          formattedDate = new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          formattedDate = String(dStr);
        }
      }
      return {
        title: w.title || 'Creative Deliverable',
        type: (w as unknown as { type?: string }).type || (w as unknown as { category?: string }).category || 'Deliverable',
        rate: unitRate,
        quantity: 1,
        amount: unitRate,
        date: formattedDate
      };
    });
  }

  // Fallback: If no work objects exist in DB for this client
  const fallbackRate = ratePerTask > 0 ? ratePerTask : totalAmount;
  const fallbackQty = ratePerTask > 0 ? Math.max(1, Math.round(totalAmount / ratePerTask)) : 1;
  return [{
    title: 'Freelance & Creative Services - ' + payment.client,
    type: 'Service Package',
    rate: fallbackRate,
    quantity: fallbackQty,
    amount: totalAmount,
    date: invDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }];
}

/**
 * Converts an array of objects to a CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header];
      const stringVal = val === null || val === undefined ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a browser download for a CSV file
 */
export function downloadCSV<T extends Record<string, unknown>>(data: T[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Generates a clean, modern, itemized HTML invoice with full product deliverable history
 */
export function downloadInvoice(
  payment: Payment, 
  symbol: string = '₹',
  agencyName?: string,
  agencyLogoUrl?: string,
  agencyBrandingMode: 'logo' | 'text' | 'both' = 'both',
  lineItems?: InvoiceLineItem[] | Array<{ title: string; amount: number; date?: string; rate?: number; quantity?: number }>,
  defaultRate?: number,
  agencyScannerUrl?: string,
  clients?: Client[],
  works?: Work[]
) {
  // Resolve line items if empty or not provided
  let resolvedItems: InvoiceLineItem[] = [];
  if (lineItems && lineItems.length > 0) {
    resolvedItems = lineItems.map(item => ({
      title: item.title,
      date: (item as unknown as { date?: string }).date,
      type: (item as unknown as { type?: string }).type,
      rate: item.rate !== undefined ? item.rate : item.amount,
      quantity: item.quantity !== undefined ? item.quantity : 1,
      amount: item.amount
    }));
  } else if (clients && works) {
    resolvedItems = resolveLineItemsForInvoice(payment, clients, works);
  }

  // Fallback if still empty
  if (resolvedItems.length === 0) {
    const totalAmount = Number(payment.amount) || 0;
    const rate = defaultRate && defaultRate > 0 ? defaultRate : totalAmount;
    const qty = defaultRate && defaultRate > 0 ? Math.max(1, Math.round(totalAmount / defaultRate)) : 1;
    resolvedItems = [{
      title: `Freelance Services - ${payment.client}`,
      rate,
      quantity: qty,
      amount: totalAmount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }];
  }

  let logoHtml = '';
  if (agencyLogoUrl && agencyBrandingMode !== 'text') {
    logoHtml += `<img src="${agencyLogoUrl}" alt="${agencyName || 'Logo'}" style="max-height: 48px; max-width: 180px; object-fit: contain; vertical-align: middle;" />`;
  }
  if (agencyBrandingMode === 'both' || !agencyLogoUrl || agencyBrandingMode === 'text') {
    const textStyle = (agencyLogoUrl && agencyBrandingMode !== 'text') ? 'margin-left: 12px; font-size: 20px;' : '';
    logoHtml += `<span class="logo" style="${textStyle} vertical-align: middle;">${agencyName || 'FREELANCE OS'}</span>`;
  }

  const status = (payment.payment_status || 'Pending').toLowerCase();
  const statusBadge = status === 'paid' 
    ? '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">✓ Paid</span>'
    : status === 'overdue'
    ? '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">⚠ Overdue</span>'
    : '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #fffbeb; color: #d97706; border: 1px solid #fde68a; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">● Payment Pending</span>';

  const tableRows = resolvedItems.map((item, index) => {
    const itemRate = item.rate !== undefined ? Number(item.rate) : Number(item.amount);
    const itemQty = item.quantity !== undefined ? item.quantity : 1;
    const itemTotal = Number(item.amount);
    
    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 16px 14px; font-size: 12px; color: #94a3b8; font-weight: 700; width: 40px; text-align: center;">${index + 1}</td>
        <td style="padding: 16px 14px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 14px; line-height: 1.4;">${item.title}</div>
          ${item.date ? `<div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 4px;">📅 Delivered on ${item.date}</div>` : ''}
        </td>
        <td style="padding: 16px 14px; font-size: 13px; font-weight: 600; color: #334155; white-space: nowrap;">${symbol}${itemRate.toLocaleString()}</td>
        <td style="padding: 16px 14px; font-size: 13px; font-weight: 600; color: #334155; text-align: center; width: 60px;">${itemQty}</td>
        <td style="padding: 16px 14px; font-size: 14px; font-weight: 800; color: #0f172a; text-align: right; white-space: nowrap;">${symbol}${itemTotal.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  const dateIssued = payment.invoiceDate 
    ? new Date(payment.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalAmountFormatted = Number(payment.amount).toLocaleString();
  const invoiceId = payment.id ? payment.id.slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${payment.client} - #INV-${invoiceId}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; 
          padding: 48px; 
          color: #0f172a; 
          background: #ffffff;
          line-height: 1.5; 
          max-width: 900px;
          margin: 0 auto;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          border-bottom: 2px solid #f1f5f9; 
          padding-bottom: 28px; 
          margin-bottom: 32px; 
        }
        .logo { 
          font-size: 22px; 
          font-weight: 900; 
          color: #4f46e5; 
          letter-spacing: -0.5px;
        }
        .invoice-tag {
          text-align: right;
        }
        .invoice-title { 
          font-size: 32px; 
          font-weight: 900; 
          text-transform: uppercase; 
          letter-spacing: -1px; 
          color: #0f172a;
          line-height: 1;
          margin-bottom: 8px;
        }
        .invoice-number {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .details-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 32px; 
          margin-bottom: 36px; 
          background: #f8fafc;
          padding: 24px 28px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        .section-label { 
          font-size: 10px; 
          font-weight: 800; 
          text-transform: uppercase; 
          color: #64748b; 
          letter-spacing: 1px; 
          margin-bottom: 6px; 
        }
        .client-name { 
          font-size: 18px; 
          font-weight: 900; 
          color: #0f172a;
          letter-spacing: -0.3px;
        }
        .client-sub {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
          text-align: right;
        }
        .meta-item {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }
        .meta-item .meta-k {
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        .meta-item .meta-v {
          font-weight: 800;
          color: #0f172a;
        }
        .table-wrap {
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          margin-top: 24px;
        }
        .table { 
          border-collapse: collapse; 
          width: 100%; 
        }
        .table th { 
          text-align: left; 
          background: #f8fafc; 
          padding: 14px; 
          font-size: 10px; 
          font-weight: 800; 
          text-transform: uppercase; 
          color: #64748b; 
          letter-spacing: 0.8px;
          border-bottom: 1px solid #e2e8f0; 
        }
        .totals-section {
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
        }
        .payment-box {
          flex: 1;
          max-width: 440px;
        }
        .qr-card {
          display: flex;
          gap: 18px;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 18px;
          border-radius: 18px;
        }
        .qr-img {
          height: 100px;
          width: 100px;
          object-fit: contain;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 4px;
        }
        .grand-total-card {
          text-align: right;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 22px 28px;
          border-radius: 20px;
          min-width: 240px;
        }
        .footer { 
          margin-top: 48px; 
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          font-size: 11px; 
          font-weight: 600;
          color: #94a3b8; 
          text-align: center; 
        }
        @media print {
          body { padding: 0; max-width: 100%; }
          .footer { margin-top: 32px; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logoHtml}
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px;">
            Professional Production & Creative Services
          </div>
        </div>
        <div class="invoice-tag">
          <div class="invoice-title">Invoice</div>
          <div class="invoice-number">#INV-${invoiceId}</div>
          ${statusBadge}
        </div>
      </div>

      <div class="details-grid">
        <div>
          <div class="section-label">Billed To Client</div>
          <div class="client-name">${payment.client}</div>
          <div class="client-sub">Itemized Production & Deliverable Payout</div>
        </div>
        <div class="meta-list">
          <div class="meta-item">
            <span class="meta-k">Invoice Date:</span>
            <span class="meta-v">${dateIssued}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">Payment Due:</span>
            <span class="meta-v">${payment.due_date || 'Due Upon Receipt'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-k">Deliverables Count:</span>
            <span class="meta-v">${resolvedItems.length} ${resolvedItems.length === 1 ? 'Item' : 'Items'}</span>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Product / Deliverable Description</th>
              <th style="width: 110px;">Unit Rate</th>
              <th style="width: 60px; text-align: center;">Qty</th>
              <th style="text-align: right; width: 120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>

      <div class="totals-section">
        <div class="payment-box">
          ${agencyScannerUrl ? `
            <div class="qr-card">
              <img src="${agencyScannerUrl}" alt="Scan to Pay" class="qr-img" />
              <div>
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 1px; margin-bottom: 4px;">Scan & Pay (UPI)</div>
                <div style="font-size: 11px; font-weight: 600; color: #64748b; line-height: 1.4;">Scan this QR code with Google Pay, PhonePe, Paytm or any UPI app to settle this invoice.</div>
              </div>
            </div>
          ` : `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px 22px; border-radius: 18px; color: #64748b; font-size: 12px; line-height: 1.5;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 1px; margin-bottom: 5px;">Payment Terms & Notes</div>
              Please remit full payment by the due date. For questions regarding deliverable specifications or wire details, please contact us directly.
            </div>
          `}
        </div>

        <div class="grand-total-card">
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Grand Total Due</div>
          <div style="font-size: 36px; font-weight: 900; color: #4f46e5; letter-spacing: -1.5px; line-height: 1;">${symbol}${totalAmountFormatted}</div>
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px;">${resolvedItems.length} itemized ${resolvedItems.length === 1 ? 'deliverable' : 'deliverables'}</div>
        </div>
      </div>

      <div class="footer">
        Thank you for your business! · Generated automatically by ${agencyName || 'FREELANCE OS'}
      </div>

      <script>window.print();</script>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const clientSanitized = payment.client.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
  link.setAttribute('download', `${clientSanitized}_INV-${invoiceId}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
