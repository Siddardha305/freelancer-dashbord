'use server'

import dbConnect from '@/database/mongodb'
import Payment from '@/database/models/Payment'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSessionUser } from '@/lib/session'

const PaymentSchema = z.object({
  client: z.string().min(1, "Client is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  payment_status: z.string().default("Pending"),
})

export async function getPaymentsAction() {
  const user = await getSessionUser()
  if (!user) return []

  await dbConnect()
  try {
    const payments = await Payment.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(payments)).map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString()
    }))
  } catch (error) {
    console.error("Error fetching payments:", error)
    return []
  }
}

export async function createPaymentAction(prevState: any, formData: FormData) {
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
    const result = await Payment.deleteOne({ _id: id, userId: user._id })
    
    if (result.deletedCount === 0) {
      // Try string ID if legacy or other issues (fallback)
      await Payment.deleteOne({ id: id, userId: user._id })
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error deleting payment:", error)
    return { message: 'Database Error' }
  }
}
