import { Payment } from '@/types/payment';

/**
 * Converts an array of objects into a CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header];
      // Escape quotes and handle commas
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
 * Generates a simple, professional HTML invoice
 */
export function downloadInvoice(
  payment: Payment, 
  symbol: string = '₹',
  agencyName?: string,
  agencyLogoUrl?: string,
  agencyBrandingMode: "logo" | "text" | "both" = "both",
  lineItems?: Array<{ title: string; amount: number }>,
  defaultRate?: number,
  agencyScannerUrl?: string
) {
  let logoHtml = '';
  if (agencyLogoUrl && agencyBrandingMode !== 'text') {
    logoHtml += `<img src="${agencyLogoUrl}" alt="${agencyName || 'Logo'}" style="max-height: 40px; max-width: 150px; object-fit: contain; vertical-align: middle;" />`;
  }
  if (agencyBrandingMode === 'both' || !agencyLogoUrl || agencyBrandingMode === 'text') {
    const textStyle = (agencyLogoUrl && agencyBrandingMode !== 'text') ? 'margin-left: 10px; font-size: 20px;' : '';
    logoHtml += `<span class="logo" style="${textStyle} vertical-align: middle;">${agencyName || 'FREELANCE OS'}</span>`;
  }

  let tableRows = '';
  if (lineItems && lineItems.length > 0) {
    tableRows = lineItems.map((item) => `
      <tr>
        <td style="font-weight: 700;">${item.title}</td>
        <td>${symbol}${Number(item.amount).toLocaleString()}</td>
        <td>1</td>
        <td style="text-align: right; font-weight: 700;">${symbol}${Number(item.amount).toLocaleString()}</td>
      </tr>
    `).join('');
  } else {
    const totalAmount = Number(payment.amount) || 0;
    const rate = defaultRate && defaultRate > 0 ? defaultRate : totalAmount;
    const qty = defaultRate && defaultRate > 0 ? Math.round(totalAmount / defaultRate) : 1;

    tableRows = `
      <tr>
        <td style="font-weight: 700;">Freelance Services - ${payment.client}</td>
        <td>${symbol}${Number(rate).toLocaleString()}</td>
        <td>${qty}</td>
        <td style="text-align: right; font-weight: 700;">${symbol}${Number(totalAmount).toLocaleString()}</td>
      </tr>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${payment.client} - #${payment.id.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #4f46e5; font-family: 'Inter', sans-serif; }
        .invoice-title { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
        .details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
        .value { font-size: 14px; font-weight: 600; }
        .table { border-collapse: collapse; width: 100%; margin-top: 40px; }
        .table th { text-align: left; background: #f8fafc; padding: 15px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .table td { padding: 20px 15px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        .footer { margin-top: 100px; font-size: 10px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>${logoHtml}</div>
        <div class="invoice-title">Invoice</div>
      </div>
      <div class="details">
        <div>
          <div class="label">Billed To</div>
          <div class="value">${payment.client}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Invoice Number</div>
          <div class="value">#INV-${payment.id.slice(-6).toUpperCase()}</div>
          <div class="label" style="margin-top: 15px;">Date Issued</div>
          <div class="value">${new Date().toLocaleDateString()}</div>
          <div class="label" style="margin-top: 15px;">Due Date</div>
          <div class="value">${payment.due_date}</div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Rate</th>
            <th>Quantity</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; border-top: 2px solid #f1f5f9; padding-top: 30px;">
        <div>
          ${agencyScannerUrl ? `
            <div style="display: flex; gap: 20px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 20px; max-width: 340px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
              <img src="${agencyScannerUrl}" alt="Payment QR" style="height: 100px; width: 100px; object-fit: contain; border-radius: 12px; background: white; border: 1px solid #e2e8f0; padding: 4px;" />
              <div style="font-family: 'Inter', sans-serif;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #4f46e5; letter-spacing: 1px; margin-bottom: 4px;">Scan to Pay</div>
                <div style="font-size: 11px; font-weight: 600; color: #64748b; line-height: 1.4;">Scan this QR code using any UPI or payment app to complete your transaction.</div>
              </div>
            </div>
          ` : `
            <div style="font-family: 'Inter', sans-serif; color: #64748b; font-size: 12px; max-width: 340px; line-height: 1.6;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px;">Payment Terms</div>
              Please remit payment by the due date. For any questions regarding services or payment methods, please reach out directly.
            </div>
          `}
        </div>
        <div style="text-align: right; min-width: 200px;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Grand Total</div>
          <div style="font-size: 36px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; line-height: 1;">${symbol}${Number(payment.amount).toLocaleString()}</div>
        </div>
      </div>
      <div class="footer">
        Thank you for your business. Please make payment by the due date.
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
  const invoiceId = payment.id.slice(-6).toUpperCase();
  link.setAttribute('download', `${clientSanitized}_INV-${invoiceId}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
