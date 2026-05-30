'use server'

import dbConnect from '@/database/mongodb'
import Payment from '@/database/models/Payment'
import Client from '@/database/models/Client'
import Work from '@/database/models/Work'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSessionUser } from '@/lib/session'
import mongoose from 'mongoose'

const PaymentSchema = z.object({
  client: z.string().min(1, "Client is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  payment_status: z.string().default("Pending"),
})

interface LeanPaymentDoc {
  _id: { toString(): string };
  client: string;
  amount: number;
  due_date: string;
  payment_status: string;
  createdAt: string;
  updatedAt: string;
}

async function autoGenerateInvoices(userId: string) {
  try {
    const activeClients = await Client.find({ userId, status: 'Active' });
    if (!activeClients || activeClients.length === 0) return;

    const today = new Date();
    
    // We want to check two months:
    // 1. The previous month
    // 2. The current month (only check if today is the last day of the current month)
    const monthsToCheck: Date[] = [];
    
    // Previous month: subtract 1 month
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    monthsToCheck.push(prevMonthDate);
    
    // Current month last day check
    const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() === lastDayOfCurrentMonth) {
      monthsToCheck.push(today);
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (const monthDate of monthsToCheck) {
      const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      
      for (const client of activeClients) {
        // Check if an invoice already exists for this client in this month (include deleted invoices to prevent auto-recreation)
        const existingInvoice = await Payment.findOne({
          userId,
          client: client.name,
          invoiceDate: { $gte: start, $lte: end }
        });
        
        if (existingInvoice) {
          continue;
        }
        
        // Calculate taskStartDate dynamically using rolling billing logic
        const clientPayments = await Payment.find({
          userId,
          client: client.name,
          isDeleted: { $ne: true }
        });

        const unpaidPayments = clientPayments.filter(p => p.payment_status === "Pending" || p.payment_status === "Overdue");
        
        let taskStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0); // Default to start of month being checked
        
        if (unpaidPayments.length > 0) {
          let earliestUnpaidDate = new Date();
          unpaidPayments.forEach(p => {
            const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date());
            if (d < earliestUnpaidDate) {
              earliestUnpaidDate = d;
            }
          });
          taskStartDate = new Date(earliestUnpaidDate.getFullYear(), earliestUnpaidDate.getMonth(), 1, 0, 0, 0, 0);
        } else {
          const paidPayments = clientPayments.filter(p => p.payment_status === "Paid");
          if (paidPayments.length > 0) {
            let latestPaidDate = new Date(0);
            paidPayments.forEach(p => {
              const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date(0));
              if (d > latestPaidDate) {
                latestPaidDate = d;
              }
            });
            taskStartDate = latestPaidDate;
          }
        }

        // Fetch completed tasks for this client
        const allClientWorks = await Work.find({
          userId,
          client: client.name,
          status: { $in: ['Completed', 'Done'] }
        });

        // Filter tasks completed between taskStartDate and target end date
        const completedTasks = allClientWorks.filter((w: any) => {
          const dateVal = w.completedAt || w.updatedAt || w.createdAt;
          if (!dateVal) return false;
          const d = new Date(dateVal);
          return d > taskStartDate && d <= end;
        });

        const completedCount = completedTasks.length;

        // If no tasks completed in this period, payout earned is 0 rs, do NOT create invoice!
        if (completedCount === 0) {
          continue;
        }

        // 2. Calculate invoice amount (Payout Earned = completedCount * ratePerTask)
        const quota = client.thumbnails_per_month || 8;
        const ratePerTask = client.price_per_thumbnail > 0
          ? client.price_per_thumbnail
          : (quota > 0 ? (client.monthly_price || 0) / quota : 0);
        
        const amount = completedCount * ratePerTask;
        
        // Only generate invoice if amount is greater than 0
        if (amount > 0) {
          const invoiceDate = end; // Last day of the month
          const dueDate = new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const dueDateString = `${monthNames[dueDate.getMonth()]} ${String(dueDate.getDate()).padStart(2, '0')}, ${dueDate.getFullYear()}`;
          
          // Unique invoice number: e.g. INV-YYMM-[random 4 digits]
          const yy = String(invoiceDate.getFullYear()).substring(2);
          const mm = String(invoiceDate.getMonth() + 1).padStart(2, '0');
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const invoiceNumber = `INV-${yy}${mm}-${randomSuffix}`;
          
          await Payment.create({
            userId,
            client: client.name,
            amount: String(amount),
            invoiceNumber,
            invoiceDate,
            dueDate,
            due_date: dueDateString,
            payment_status: 'Pending',
            currency: client.currency || 'INR',
            isRecurring: true
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in autoGenerateInvoices:", error);
  }
}

export async function getPaymentsAction() {
  const user = await getSessionUser()
  if (!user) return []

  await dbConnect()
  try {
    await autoGenerateInvoices(user._id);
    const payments = await Payment.find({ userId: user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(payments)).map((doc: LeanPaymentDoc) => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString()
    }))
  } catch (error) {
    console.error("Error fetching payments:", error)
    return []
  }
}

export async function createPaymentAction(prevState: unknown, formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  const rawData = {
    client: formData.get('client'),
    amount: formData.get('amount'),
    due_date: formData.get('due_date'),
    payment_status: formData.get('payment_status') || 'Pending',
  }

  const validatedFields = PaymentSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Payment.',
    }
  }

  try {
    await dbConnect()
    const newPayment = await Payment.create({
      ...validatedFields.data,
      userId: user._id,
    })

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    
    return { 
      message: 'success', 
      payment: JSON.parse(JSON.stringify({
        ...newPayment.toObject(),
        _id: newPayment._id.toString(),
        id: newPayment._id.toString()
      }))
    }
  } catch (error) {
    console.error("MongoDB Error:", error)
    return {
      message: 'Database Error: Failed to Create Payment.',
    }
  }
}

export async function updatePaymentStatusAction(id: string, newStatus: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    const updated = await Payment.findOneAndUpdate(
      { _id: id, userId: user._id },
      { payment_status: newStatus },
      { new: true }
    )
    
    if (!updated) {
      return { message: 'Payment record not found' }
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error updating status:", error)
    return { message: 'Database Error: Failed to Update Payment Status.' }
  }
}

export async function deletePaymentAction(id: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    
    const paymentObjectId = new mongoose.Types.ObjectId(id)
    const userObjectId = new mongoose.Types.ObjectId(user._id)

    const result = await Payment.collection.updateOne(
      { _id: paymentObjectId, userId: userObjectId },
      { $set: { isDeleted: true } }
    )
    
    if (result.matchedCount === 0) {
      await Payment.collection.updateOne(
        { id: id, userId: user._id },
        { $set: { isDeleted: true } }
      )
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error soft-deleting payment:", error)
    return { message: 'Database Error' }
  }
}

export async function generateAllInvoicesAction() {
  const user = await getSessionUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  await dbConnect()
  try {
    const activeClients = await Client.find({ userId: user._id, status: 'Active' });
    if (!activeClients || activeClients.length === 0) {
      return { success: true, message: 'No active clients found', count: 0 };
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let createdCount = 0;

    for (const client of activeClients) {
      // Check if an active (non-deleted) invoice already exists for this client in the current month
      const existingInvoice = await Payment.findOne({
        userId: user._id,
        client: client.name,
        invoiceDate: { $gte: start, $lte: end },
        isDeleted: { $ne: true }
      });
      
      if (existingInvoice) {
        continue;
      }
      
      // Calculate taskStartDate dynamically using rolling billing logic
      const clientPayments = await Payment.find({
        userId: user._id,
        client: client.name,
        isDeleted: { $ne: true }
      });

      const unpaidPayments = clientPayments.filter(p => p.payment_status === "Pending" || p.payment_status === "Overdue");
      
      let taskStartDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0); // Default to start of current month
      
      if (unpaidPayments.length > 0) {
        let earliestUnpaidDate = new Date();
        unpaidPayments.forEach(p => {
          const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date());
          if (d < earliestUnpaidDate) {
            earliestUnpaidDate = d;
          }
        });
        taskStartDate = new Date(earliestUnpaidDate.getFullYear(), earliestUnpaidDate.getMonth(), 1, 0, 0, 0, 0);
      } else {
        const paidPayments = clientPayments.filter(p => p.payment_status === "Paid");
        if (paidPayments.length > 0) {
          let latestPaidDate = new Date(0);
          paidPayments.forEach(p => {
            const d = p.invoiceDate ? new Date(p.invoiceDate) : (p.createdAt ? new Date(p.createdAt) : new Date(0));
            if (d > latestPaidDate) {
              latestPaidDate = d;
            }
          });
          taskStartDate = latestPaidDate;
        }
      }

      // Fetch completed tasks for this client
      const allClientWorks = await Work.find({
        userId: user._id,
        client: client.name,
        status: { $in: ['Completed', 'Done'] }
      });

      // Filter tasks in memory using taskStartDate
      const completedTasks = allClientWorks.filter((w: any) => {
        const dateVal = w.completedAt || w.updatedAt || w.createdAt;
        if (!dateVal) return false;
        const d = new Date(dateVal);
        return d > taskStartDate;
      });

      const completedCount = completedTasks.length;

      // If no tasks completed in the current period, do NOT create invoice!
      if (completedCount === 0) {
        continue;
      }

      // 2. Calculate invoice amount (Payout Earned = completedCount * ratePerTask)
      const quota = client.thumbnails_per_month || 8;
      const ratePerTask = client.price_per_thumbnail > 0
        ? client.price_per_thumbnail
        : (quota > 0 ? (client.monthly_price || 0) / quota : 0);
      
      const amount = completedCount * ratePerTask;
      
      // Only generate invoice if amount is greater than 0
      if (amount > 0) {
        const invoiceDate = today; // Using today for manual creation
        const dueDate = new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dueDateString = `${monthNames[dueDate.getMonth()]} ${String(dueDate.getDate()).padStart(2, '0')}, ${dueDate.getFullYear()}`;
        
        // Unique invoice number
        const yy = String(invoiceDate.getFullYear()).substring(2);
        const mm = String(invoiceDate.getMonth() + 1).padStart(2, '0');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${yy}${mm}-${randomSuffix}`;
        
        await Payment.create({
          userId: user._id,
          client: client.name,
          amount: String(amount),
          invoiceNumber,
          invoiceDate,
          dueDate,
          due_date: dueDateString,
          payment_status: 'Pending',
          currency: client.currency || 'INR',
          isRecurring: true
        });
        
        createdCount++;
      }
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    
    return {
      success: true,
      message: `Successfully generated ${createdCount} invoices.`,
      count: createdCount
    };
  } catch (error) {
    console.error("Error in generateAllInvoicesAction:", error);
    return { success: false, message: 'Server error generating invoices' };
  }
}
