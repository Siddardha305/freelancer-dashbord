/**
 * Converts an array of objects into a CSV string
 */
export function convertToCSV(data: any[]): string {
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
export function downloadCSV(data: any[], filename: string) {
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
export function downloadInvoice(payment: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${payment.id.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #4f46e5; }
        .invoice-title { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
        .details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
        .value { font-size: 14px; font-weight: 600; }
        .table { w-full border-collapse: collapse; width: 100%; margin-top: 40px; }
        .table th { text-align: left; background: #f8fafc; padding: 15px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .table td { padding: 20px 15px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        .total-section { margin-top: 40px; text-align: right; border-top: 2px solid #f1f5f9; padding-top: 20px; }
        .total-label { font-size: 14px; font-weight: 700; color: #64748b; }
        .total-value { font-size: 32px; font-weight: 900; color: #4f46e5; }
        .footer { margin-top: 100px; font-size: 10px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">FREELANCE OS</div>
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
          <tr>
            <td style="font-weight: 700;">Freelance Services - ${payment.client}</td>
            <td>₹${Number(payment.amount).toLocaleString()}</td>
            <td>1</td>
            <td style="text-align: right; font-weight: 700;">₹${Number(payment.amount).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <div class="total-section">
        <div class="total-label">Grand Total</div>
        <div class="total-value">₹${Number(payment.amount).toLocaleString()}</div>
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
  link.setAttribute('download', `Invoice_${payment.id.slice(-6).toUpperCase()}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
