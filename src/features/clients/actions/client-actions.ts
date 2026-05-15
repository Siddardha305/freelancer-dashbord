'use server'

import dbConnect from '@/lib/mongodb'
import Client from '@/models/Client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/mail'

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  niche: z.string().nullable().optional().transform(v => !v || v.trim() === "" ? "General" : v),
  email: z.string().email("Invalid email").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional().or(z.literal("")),
  country: z.string().nullable().optional().or(z.literal("")),
  timezone: z.string().nullable().optional().or(z.literal("")),
  status: z.string().default("Active"),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  monthly_price: z.coerce.number().min(0, "Price must be positive").default(0),
  pricing_model: z.string().default("monthly"),
  channel_link: z.string().nullable().optional().or(z.literal("")),
  avatar: z.string().nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  totalEarned: z.coerce.number().default(0),
  contractStartDate: z.string().nullable().optional().or(z.literal("")),
  contractEndDate: z.string().nullable().optional().or(z.literal("")),
  lastContactedAt: z.string().nullable().optional().or(z.literal("")),
  referredBy: z.string().nullable().optional().or(z.literal("")),
  thumbnails_per_month: z.coerce.number().min(0).default(0),
  price_per_thumbnail: z.coerce.number().min(0).default(0),
})

export async function getClientsAction() {
  await dbConnect()
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(clients)).map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getClientByIdAction(id: string) {
  await dbConnect()
  try {
    const client = await Client.findById(id).lean()
    if (!client) return null
    return JSON.parse(JSON.stringify({
      ...client,
      id: client._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching client by ID:", error)
    return null
  }
}

export async function createClientAction(prevState: any, formData: FormData) {
  await dbConnect()
  const rawData: any = {}
  formData.forEach((value, key) => {
    if (key === 'tags') {
      rawData[key] = (value as string).split(',').map(t => t.trim()).filter(t => t)
    } else {
      rawData[key] = value
    }
  })

  try {
    const validatedFields = ClientSchema.safeParse(rawData)

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validation Error',
      }
    }

    const newClient = await Client.create(validatedFields.data)
    
    // Send automated thank you email
    if (newClient.email) {
      sendWelcomeEmail(newClient.email, newClient.name);
    }
    
    revalidatePath('/clients')
    revalidatePath('/')
    
    return { 
      message: 'success', 
      client: JSON.parse(JSON.stringify({
        ...newClient.toObject(),
        id: newClient._id.toString()
      }))
    }
  } catch (error: any) {
    return { message: error.message || 'Database Error' }
  }
}

export async function updateClientAction(id: string, data: any) {
  await dbConnect()
  try {
    const validatedFields = ClientSchema.partial().safeParse(data)
    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation Error' }
    }

    const updatedClient = await Client.findByIdAndUpdate(id, validatedFields.data, { new: true }).lean()
    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    revalidatePath('/')
    
    return { 
      message: 'success', 
      client: JSON.parse(JSON.stringify({
        ...updatedClient,
        id: updatedClient?._id.toString()
      }))
    }
  } catch (error: any) {
    return { message: error.message || 'Database Error' }
  }
}

export async function deleteClientAction(id: string) {
  try {
    await dbConnect()
    await Client.findByIdAndDelete(id)
    revalidatePath('/clients')
    revalidatePath('/')
    return { message: 'success' }
  } catch (error) {
    console.error("Error deleting client:", error)
    return { message: 'Database Error' }
  }
}

