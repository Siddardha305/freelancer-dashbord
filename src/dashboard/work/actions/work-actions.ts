'use server'

import dbConnect from '@/database/mongodb'
import Work from '@/database/models/Work'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSessionUser } from '@/lib/session'
import { sendSlackNotification } from '@/lib/slack'

const WorkSchema = z.object({
  client: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional().or(z.literal("")),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["To Do", "In Progress", "Review", "Done", "Completed"]).default("To Do"),
  priority: z.enum(["Urgent", "High", "Normal", "Low"]).default("Normal"),
  attachments: z.array(z.string()).default([]),
  videoLink: z.string().nullable().optional().or(z.literal("")),
  estimatedHours: z.coerce.number().default(0),
  actualHours: z.coerce.number().default(0),
  revisions: z.coerce.number().default(0),
  approvedByClient: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().nullable().optional().or(z.literal("")),
  reviewerId: z.string().nullable().optional().or(z.literal("")),
})

interface LeanWorkDoc {
  _id: { toString(): string };
  client: string;
  title: string;
  deadline: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedTo?: string;
  reviewerId?: string;
}

export async function getWorksAction() {
  const user = await getSessionUser()
  if (!user) return []

  await dbConnect()
  try {
    const mongoose = require('mongoose');
    const query: Record<string, any> = {
      userId: mongoose.isValidObjectId(user.workspaceId)
        ? new mongoose.Types.ObjectId(user.workspaceId)
        : user.workspaceId
    }
    if (user.teamRole === 'editor') {
      const editorIdObj = mongoose.isValidObjectId(user.id)
        ? new mongoose.Types.ObjectId(user.id)
        : null;
      query.$or = [
        { assignedTo: user.id },
        ...(editorIdObj ? [{ assignedTo: editorIdObj }] : [])
      ];
    }
    const works = await Work.collection.find(query).sort({ createdAt: -1 }).toArray()
    return JSON.parse(JSON.stringify(works)).map((doc: LeanWorkDoc) => ({
      ...doc,
      id: doc._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching works:", error)
    return []
  }
}

export async function createWorkAction(prevState: unknown, formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  // RBAC Permission Check
  if (user.teamRole === 'viewer') {
    return { message: 'Your permission level does not allow creating tasks.' }
  }

  await dbConnect()
  const rawData: Record<string, unknown> = {}
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
    const dataToSave = {
      ...validatedFields.data,
      assignedTo: validatedFields.data.assignedTo || null,
      reviewerId: validatedFields.data.reviewerId || null,
      userId: user.workspaceId,
    }
    const newWork = await Work.create(dataToSave)
    // Trigger Slack notification if webhook is configured
    if (user.slackWebhookUrl) {
      sendSlackNotification({
        webhookUrl: user.slackWebhookUrl,
        title: "📅 New Task Created",
        text: `A new task *"${newWork.title}"* has been created for client *${newWork.client}*.`,
        color: "#4f46e5",
        fields: [
          { title: "Priority", value: newWork.priority || "Normal", short: true },
          { title: "Deadline", value: new Date(newWork.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), short: true },
        ],
      }).catch(err => console.error("Slack trigger failed:", err));
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success', id: newWork._id.toString() }
  } catch (error) {
    console.error("Error creating work task:", error);
    return { message: 'Database Error' }
  }
}

export async function updateWorkStatusAction(id: string, newStatus: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  try {
    await dbConnect()
    const task = await Work.findOne({ _id: id, userId: user.workspaceId })
    if (!task) {
      return { message: 'Work task not found' }
    }

    const isCorp = user.workspaceType === 'corporate'
    const isManager = user.teamRole === 'owner' || user.teamRole === 'admin' || !user.teamRole

    const updateData: Record<string, any> = { status: newStatus }

    if (isCorp) {
      // Rule 1: Only manager/owner, admin, or the designated reviewer can mark task completed/done
      if (!isManager && (newStatus === 'Completed' || newStatus === 'Done')) {
        const isDesignatedReviewer = task.reviewerId && task.reviewerId.toString() === user.id
        if (!isDesignatedReviewer) {
          return { message: 'Only the designated reviewer or manager can mark this task as completed.' }
        }
      }

      // Rule 2: If task is moved to Review, set default reviewer to the workspace manager (userId) if not set
      if (newStatus === 'Review' && !task.reviewerId) {
        updateData.reviewerId = task.userId
      }
    }

    if (newStatus === 'Completed' || newStatus === 'Done') {
      updateData.completedAt = new Date().toISOString()
    } else {
      updateData.completedAt = null
    }
    
    const updated = await Work.findOneAndUpdate(
      { _id: id, userId: user.workspaceId },
      updateData,
      { new: true }
    )
    
    if (!updated) {
      return { message: 'Work task not found' }
    }

    // Trigger Slack notification if webhook is configured
    if (user.slackWebhookUrl) {
      const isCompleted = updated.status === 'Completed' || updated.status === 'Done';
      sendSlackNotification({
        webhookUrl: user.slackWebhookUrl,
        title: isCompleted ? "✅ Task Completed" : "🔄 Task Status Updated",
        text: `The status of task *"${updated.title}"* (Client: *${updated.client}*) has been updated to *${updated.status}*.`,
        color: isCompleted ? "#10b981" : "#f59e0b",
        fields: [
          { title: "New Status", value: updated.status, short: true },
          { title: "Priority", value: updated.priority || "Normal", short: true },
        ],
      }).catch(err => console.error("Slack trigger failed:", err));
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("Error updating work status:", error);
    return { message: 'Database Error' }
  }
}

export async function updateWorkAction(id: string, data: Record<string, unknown>) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  // RBAC Permission Check
  if (user.teamRole === 'viewer') {
    return { message: 'Your permission level is view-only. You cannot perform this operation.' }
  }

  try {
    await dbConnect()
    const task = await Work.findOne({ _id: id, userId: user.workspaceId })
    if (!task) {
      return { message: 'Work task not found' }
    }

    const validatedFields = WorkSchema.partial().safeParse(data)
    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation Error' }
    }
    
    const dataToUpdate = {
      ...validatedFields.data
    }
    if ('assignedTo' in dataToUpdate) {
      dataToUpdate.assignedTo = dataToUpdate.assignedTo || null
    }
    if ('reviewerId' in dataToUpdate) {
      dataToUpdate.reviewerId = dataToUpdate.reviewerId || null
    }

    const isCorp = user.workspaceType === 'corporate'
    const isManager = user.teamRole === 'owner' || user.teamRole === 'admin' || !user.teamRole

    if (isCorp) {
      const newStatus = dataToUpdate.status;
      
      // Rule 1: Only manager/owner, admin, or the designated reviewer can mark task completed/done
      if (!isManager && newStatus && (newStatus === 'Completed' || newStatus === 'Done')) {
        const targetReviewerId = dataToUpdate.reviewerId || task.reviewerId?.toString()
        const isDesignatedReviewer = targetReviewerId && targetReviewerId === user.id
        if (!isDesignatedReviewer) {
          return { message: 'Only the designated reviewer or manager can mark this task as completed.' }
        }
      }

      // Rule 2: If task is moved to Review, set default reviewer to the workspace manager (userId) if not set
      if (newStatus === 'Review' && !dataToUpdate.reviewerId && !task.reviewerId) {
        dataToUpdate.reviewerId = task.userId.toString()
      }
    }

    if (dataToUpdate.status === 'Completed' || dataToUpdate.status === 'Done') {
      dataToUpdate.completedAt = new Date().toISOString()
    } else if (dataToUpdate.status) {
      dataToUpdate.completedAt = null
    }
    
    const updated = await Work.findOneAndUpdate(
      { _id: id, userId: user.workspaceId },
      dataToUpdate,
      { new: true }
    )

    if (!updated) {
      return { message: 'Work task not found' }
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("Error updating work task:", error);
    return { message: 'Database Error' }
  }
}

export async function deleteWorkAction(id: string) {
  const user = await getSessionUser()
  if (!user) return { message: 'Unauthorized' }

  // RBAC Permission Check
  if (user.teamRole === 'viewer' || user.teamRole === 'editor') {
    return { message: 'Your permission level does not allow deleting tasks.' }
  }

  try {
    await dbConnect()
    const deleted = await Work.findOneAndDelete({ _id: id, userId: user.workspaceId })
    if (!deleted) {
      return { message: 'Work task not found' }
    }

    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard')
    return { message: 'success' }
  } catch (error) {
    console.error("Error deleting work task:", error);
    return { message: 'Database Error' }
  }
}
