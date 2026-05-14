'use server'

import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PaymentSchema = z.object({
  client: z.string().min(1, "Client is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  payment_status: z.string().default("Pending"),
})

export async function getPaymentsAction() {
  await dbConnect()
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).lean()
    return payments.map(doc => ({
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
    const newPayment = await Payment.create(validatedFields.data)

    revalidatePath('/payments')
    revalidatePath('/')
    
    return { 
      message: 'success', 
      payment: {
        ...newPayment.toObject(),
        _id: newPayment._id.toString(),
        id: newPayment._id.toString()
      }
    }
  } catch (error) {
    console.error("MongoDB Error:", error)
    return {
      message: 'Database Error: Failed to Create Payment.',
    }
  }
}

export async function updatePaymentStatusAction(id: string, newStatus: string) {
  try {
    await dbConnect()
    await Payment.findByIdAndUpdate(id, { payment_status: newStatus })
    revalidatePath('/payments')
    revalidatePath('/')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error updating status:", error)
    return { message: 'Database Error: Failed to Update Payment Status.' }
  }
}

export async function deletePaymentAction(id: string) {
  try {
    await dbConnect()
    const result = await Payment.deleteOne({ _id: id })
    
    if (result.deletedCount === 0) {
      // Try string ID if ObjectId didn't work (though it should)
      await Payment.deleteOne({ id: id })
    }

    revalidatePath('/payments')
    revalidatePath('/')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error deleting payment:", error)
    return { message: 'Database Error' }
  }
}
