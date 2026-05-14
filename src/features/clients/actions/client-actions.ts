'use server'

import dbConnect from '@/lib/mongodb'
import Client from '@/models/Client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  niche: z.string().nullable().optional().transform(v => !v || v.trim() === "" ? "General" : v),
  email: z.string().nullable().optional().transform(v => !v || v.trim() === "" ? "" : v),
  phone: z.string().nullable().optional().transform(v => !v || v.trim() === "" ? "" : v),
  status: z.string().default("Active"),
  monthly_price: z.coerce.number().min(0, "Price must be positive").default(0),
  pricing_model: z.string().default("monthly"),
  channel_link: z.string().nullable().optional().transform(v => !v || v.trim() === "" ? "" : v),
  thumbnails_per_month: z.coerce.number().min(0).default(0),
  price_per_thumbnail: z.coerce.number().min(0).default(0),
})

export async function getClientsAction() {
  await dbConnect()
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean()
    return clients.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString()
    }))
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function createClientAction(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    niche: formData.get('niche') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    status: (formData.get('status') as string) || 'Active',
    monthly_price: formData.get('monthly_price') || '0',
    pricing_model: (formData.get('pricing_model') as string) || 'monthly',
    channel_link: formData.get('channel_link') as string,
    thumbnails_per_month: formData.get('thumbnails_per_month') || '0',
    price_per_thumbnail: formData.get('price_per_thumbnail') || '0',
  }

  try {
    console.log("SERVER ACTION: Creating client with data:", rawData);
    const validatedFields = ClientSchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("SERVER ACTION: Validation failed:", validatedFields.error.flatten().fieldErrors);
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMsg = Object.values(fieldErrors).flat().join(", ");
      return {
        errors: fieldErrors,
        message: `Validation Error: ${errorMsg || 'Failed to Create Client.'}`,
      }
    }

    await dbConnect()
    const newClient = await Client.create(validatedFields.data)
    console.log("SERVER ACTION: Client created with ID:", newClient._id);

    revalidatePath('/clients')
    revalidatePath('/')
    
    return { 
      message: 'success', 
      client: {
        ...newClient.toObject(),
        _id: newClient._id.toString(),
        id: newClient._id.toString()
      }
    }
  } catch (error: any) {
    console.error("MongoDB Error in Action:", error.message || error)
    return {
      message: `Database Error: ${error.message || 'Failed to Create Client.'}`,
    }
  }
}

export async function deleteClientAction(id: string) {
  try {
    await dbConnect()
    const result = await Client.deleteOne({ _id: id })
    
    if (result.deletedCount === 0) {
      // Try string ID if ObjectId didn't work
      await Client.deleteOne({ id: id })
    }

    revalidatePath('/clients')
    revalidatePath('/')
    return { message: 'success' }
  } catch (error) {
    console.error("Error deleting client:", error)
    return { message: 'Database Error' }
  }
}
