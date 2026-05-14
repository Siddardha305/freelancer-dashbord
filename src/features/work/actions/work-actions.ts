'use server'

import dbConnect from '@/lib/mongodb'
import Work from '@/models/Work'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const WorkSchema = z.object({
  client: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.string().default("To Do"),
  priority: z.string().default("Medium"),
})

export async function getWorksAction() {
  await dbConnect()
  try {
    const works = await Work.find({}).sort({ createdAt: -1 }).lean()
    return works.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: doc._id.toString()
    }))
  } catch (error) {
    console.error("Error fetching works:", error)
    return []
  }
}

export async function createWorkAction(prevState: any, formData: FormData) {
  const rawData = {
    client: formData.get('client'),
    title: formData.get('title'),
    deadline: formData.get('deadline'),
    status: formData.get('status') || 'To Do',
    priority: formData.get('priority') || 'Medium',
  }

  const validatedFields = WorkSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Task.',
    }
  }

  try {
    await dbConnect()
    await Work.create(validatedFields.data)

    revalidatePath('/work')
    revalidatePath('/')
    
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error:", error)
    return {
      message: 'Database Error: Failed to Create Task.',
    }
  }
}

export async function updateWorkStatusAction(id: string, newStatus: string) {
  try {
    await dbConnect()
    await Work.findByIdAndUpdate(id, { status: newStatus })
    revalidatePath('/work')
    revalidatePath('/')
    return { message: 'success' }
  } catch (error) {
    console.error("MongoDB Error updating status:", error)
    return { message: 'Database Error: Failed to Update Task Status.' }
  }
}
