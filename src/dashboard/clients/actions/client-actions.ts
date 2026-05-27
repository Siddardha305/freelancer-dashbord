'use server'

import dbConnect from '@/database/mongodb'
import Client from '@/database/models/Client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/emails/mail'
import { getSessionUser } from '@/lib/session'
import { sendSlackNotification } from '@/lib/slack'

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
  portalSlug: z.string().nullable().optional().or(z.literal("")),
  portalToken: z.string().nullable().optional().or(z.literal("")),
  portalLogoUrl: z.string().nullable().optional().or(z.literal("")),
  portalPrimaryColor: z.string().nullable().optional().or(z.literal("")),
  portalActive: z.boolean().optional().default(false),
})

const UpdateClientSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  niche: z.string().nullable().optional().transform(v => v === undefined ? undefined : (!v || v.trim() === "" ? "General" : v)),
  email: z.string().email("Invalid email").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional().or(z.literal("")),
  country: z.string().nullable().optional().or(z.literal("")),
  timezone: z.string().nullable().optional().or(z.literal("")),
  status: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  monthly_price: z.coerce.number().min(0, "Price must be positive").optional(),
  pricing_model: z.string().optional(),
  channel_link: z.string().nullable().optional().or(z.literal("")),
  avatar: z.string().nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  totalEarned: z.coerce.number().optional(),
  contractStartDate: z.string().nullable().optional().or(z.literal("")),
  contractEndDate: z.string().nullable().optional().or(z.literal("")),
  lastContactedAt: z.string().nullable().optional().or(z.literal("")),
  referredBy: z.string().nullable().optional().or(z.literal("")),
  thumbnails_per_month: z.coerce.number().min(0).optional(),
  price_per_thumbnail: z.coerce.number().min(0).optional(),
  portalSlug: z.string().nullable().optional().or(z.literal("")).optional(),
  portalToken: z.string().nullable().optional().or(z.literal("")).optional(),
  portalLogoUrl: z.string().nullable().optional().or(z.literal("")).optional(),
  portalPrimaryColor: z.string().nullable().optional().or(z.literal("")).optional(),
  portalActive: z.boolean().optional(),
})

interface LeanClientDoc {
  _id: { toString(): string };
  name: string;
  niche: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  status: string;
  priority: string;
  monthly_price: number;
  pricing_model: string;
  createdAt: string;
  updatedAt: string;
}

export async function getClientsAction() {
  const user = await getSessionUser()
  if (!user) return []
  
  await dbConnect()
  try {
    const clients = await Client.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(clients)).map((doc: LeanClientDoc) => ({
      ...doc,
      id: doc._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

export async function getClientByIdAction(id: string) {
  const user = await getSessionUser()
  if (!user) return null

  await dbConnect()
  try {
    const client = await Client.findOne({ _id: id, userId: user._id }).lean()
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

export async function createClientAction(prevState: unknown, formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  await dbConnect()
  const rawData: Record<string, unknown> = {}
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

    const newClient = await Client.create({
      ...validatedFields.data,
      userId: user._id,
    })
    
    // Send automated thank you email
    if (newClient.email) {
      sendWelcomeEmail(newClient.email, newClient.name);
    }

    // Trigger Slack notification if webhook is configured
    if (user.slackWebhookUrl) {
      sendSlackNotification({
        webhookUrl: user.slackWebhookUrl,
        title: "👥 New Client Created",
        text: `A new client *${newClient.name}* has been added to your workspace.`,
        color: "#38bdf8",
        fields: [
          { title: "Niche", value: newClient.niche || "General", short: true },
          { title: "Email", value: newClient.email || "N/A", short: true },
        ],
      }).catch(err => console.error("Slack trigger failed:", err));
    }
    
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard')
    
    return { 
      message: 'success', 
      client: JSON.parse(JSON.stringify({
        ...newClient.toObject(),
        id: newClient._id.toString()
      }))
    }
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Database Error' }
  }
}

export async function updateClientAction(id: string, data: Record<string, unknown>) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  await dbConnect()
  try {
    const validatedFields = UpdateClientSchema.safeParse(data)
    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation Error' }
    }

    // Filter out undefined values to prevent overwriting with undefined
    const updateData = { ...validatedFields.data } as Record<string, unknown>
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, userId: user._id },
      updateData,
      { new: true }
    ).lean()
    
    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${id}`)
    revalidatePath('/dashboard')
    
    return { 
      message: 'success', 
      client: JSON.parse(JSON.stringify({
        ...updatedClient,
        id: updatedClient?._id.toString()
      }))
    }
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Database Error' }
  }
}

export async function deleteClientAction(id: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    await Client.findOneAndDelete({ _id: id, userId: user._id })
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("Error deleting client:", error)
    return { message: 'Database Error' }
  }
}

export async function generatePortalTokenAction(clientId: string) {
  const user = await getSessionUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  await dbConnect()
  try {
    const crypto = await import('crypto')
    const token = crypto.randomBytes(32).toString('hex') // 256-bit token
    const client = await Client.findOneAndUpdate(
      { _id: clientId, userId: user._id },
      { portalToken: token },
      { new: true }
    ).lean()
    
    revalidatePath(`/dashboard/clients/${clientId}`)
    return {
      success: true,
      token,
      client: JSON.parse(JSON.stringify({
        ...client,
        id: client?._id.toString()
      }))
    }
  } catch (error) {
    console.error("Error generating token:", error)
    return { success: false, message: 'Failed to generate token' }
  }
}

export async function updatePortalSettingsAction(
  clientId: string, 
  data: {
    portalActive: boolean;
    portalSlug: string;
    portalPrimaryColor: string;
    portalLogoUrl: string;
  }
) {
  const user = await getSessionUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  await dbConnect()
  try {
    const cleanSlug = data.portalSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (data.portalActive && cleanSlug.length < 3) {
      return { success: false, message: 'Portal slug must be at least 3 characters long' }
    }

    // Server-side portal logo size validation (~2MB binary = ~2.73MB base64)
    const MAX_LOGO_SIZE = 2_800_000;
    if (data.portalLogoUrl && data.portalLogoUrl.length > MAX_LOGO_SIZE) {
      return { success: false, message: 'Portal logo image exceeds the 2MB size limit' }
    }

    if (cleanSlug) {
      const existing = await Client.findOne({ 
        portalSlug: cleanSlug, 
        _id: { $ne: clientId } 
      })
      if (existing) {
        return { success: false, message: 'This portal URL slug is already taken by another client' }
      }
    }

    const updateFields: Record<string, unknown> = {
      portalActive: data.portalActive,
      portalSlug: cleanSlug || null,
      portalPrimaryColor: data.portalPrimaryColor,
      portalLogoUrl: data.portalLogoUrl || null,
    }

    if (data.portalActive) {
      const current = await Client.findOne({ _id: clientId, userId: user._id })
      if (!current.portalToken) {
        const crypto = await import('crypto')
        updateFields.portalToken = crypto.randomBytes(32).toString('hex') // 256-bit token
      }
    }

    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, userId: user._id },
      updateFields,
      { new: true }
    ).lean()

    revalidatePath(`/dashboard/clients/${clientId}`)
    if (cleanSlug) {
      revalidatePath(`/portal/${cleanSlug}`)
    }

    return {
      success: true,
      client: JSON.parse(JSON.stringify({
        ...updatedClient,
        id: updatedClient?._id.toString()
      }))
    }
  } catch (error: unknown) {
    console.error("Error updating portal settings:", error)
    return { success: false, message: error instanceof Error ? error.message : 'Database Error' }
  }
}
