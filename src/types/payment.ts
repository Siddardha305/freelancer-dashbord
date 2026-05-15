export type PaymentStatus = "Pending" | "Paid" | "Overdue";
export type PaymentMethod = "Bank" | "PayPal" | "Crypto" | "Cash";

export interface Payment {
  id: string;
  client: string;
  amount: number;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  due_date?: string; // Legacy support
  payment_status: PaymentStatus;
  taxPercent: number;
  discount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  reminderSentAt?: string;
  notes?: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string;
  updatedAt: string;
}
