'use server'

import dbConnect from '@/database/mongodb'
import Work from '@/database/models/Work'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSessionUser } from '@/lib/session'

const WorkSchema = z.object({
  client: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional().or(z.literal("")),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["To Do", "In Progress", "Review", "Done", "Completed"]).default("To Do"),
  priority: z.enum(["Urgent", "High", "Normal", "Low"]).default("Normal"),
  attachments: z.array(z.string()).default([]),
  estimatedHours: z.coerce.number().default(0),
  actualHours: z.coerce.number().default(0),
  revisions: z.coerce.number().default(0),
  approvedByClient: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
})

export async function getWorksAction() {
  const user = await getSessionUser()
  if (!user) return []

  await dbConnect()
  try {
    const works = await Work.find({ userId: user._id }).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(works)).map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching works:", error)
    return []
  }
}

export async function createWorkAction(prevState: any, formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  await dbConnect()
  const rawData: any = {}
  formData.forEach((value, key) => {
    if (key === 'attachments' || key === 'tags') {
      rawData[key] = (value as string).split(',').map(v => v.trim()).filter(v => v)
    } else if (key === 'approvedByClient') {
      rawData[key] = value === 'on' || value === 'true'
    } else {
      rawData[key] = value
    }
  })

  const validatedFields = WorkSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    }
  }

  try {
    const newWork = await Work.create({
      ...validatedFields.data,
      userId: user._id,
    })
    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success', id: newWork._id.toString() }
  } catch (error) {
    return { message: 'Database Error' }
  }
}

export async function updateWorkStatusAction(id: string, newStatus: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    const updateData: any = { status: newStatus }
    if (newStatus === 'Completed') {
      updateData.completedAt = new Date()
    }
    
    const updated = await Work.findOneAndUpdate(
      { _id: id, userId: user._id },
      updateData,
      { new: true }
    )
    
    if (!updated) {
      return { message: 'Work task not found' }
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    return { message: 'Database Error' }
  }
}

export async function updateWorkAction(id: string, data: any) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    const validatedFields = WorkSchema.partial().safeParse(data)
    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation Error' }
    }
    
    const updated = await Work.findOneAndUpdate(
      { _id: id, userId: user._id },
      validatedFields.data,
      { new: true }
    )

    if (!updated) {
      return { message: 'Work task not found' }
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    return { message: 'Database Error' }
  }
}

export async function deleteWorkAction(id: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    const deleted = await Work.findOneAndDelete({ _id: id, userId: user._id })
    if (!deleted) {
      return { message: 'Work task not found' }
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    return { message: 'Database Error' }
  }
}
