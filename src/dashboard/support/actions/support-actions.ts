'use server'

import dbConnect from '@/database/mongodb';
import SupportTicket from '@/database/models/SupportTicket';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createSupportTicketAction(data: {
  title: string;
  description: string;
  category: string;
  priority: string;
}) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  if (!data.title || !data.title.trim()) {
    return { success: false, message: 'Title is required.' };
  }
  if (!data.description || !data.description.trim()) {
    return { success: false, message: 'Description is required.' };
  }

  try {
    const ticket = await SupportTicket.create({
      userId: user.id || user._id,
      userName: user.name || 'Anonymous User',
      userEmail: user.email || '',
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'technical',
      priority: data.priority || 'medium',
      status: 'open',
    });

    revalidatePath('/dashboard/support');
    return { 
      success: true, 
      message: 'Support ticket raised successfully!', 
      ticket: JSON.parse(JSON.stringify(ticket)) 
    };
  } catch (error) {
    console.error('Failed to create support ticket:', error);
    return { success: false, message: 'Failed to submit support ticket.' };
  }
}

export async function getSupportTicketsForUserAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  try {
    const tickets = await SupportTicket.find({ userId: user.id || user._id })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(tickets));
  } catch (error) {
    console.error('Failed to get support tickets for user:', error);
    return [];
  }
}

export async function getAdminSupportTicketsAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Access denied. Administrator privileges required.');
  }

  try {
    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(tickets));
  } catch (error) {
    console.error('Failed to get support tickets for admin:', error);
    return [];
  }
}

export async function resolveSupportTicketAction(ticketId: string, adminReply: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Access denied.' };
  }

  try {
    await SupportTicket.findByIdAndUpdate(ticketId, {
      status: 'resolved',
      adminReply: adminReply.trim(),
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard/support');
    return { success: true, message: 'Support ticket resolved successfully!' };
  } catch (error) {
    console.error('Failed to resolve support ticket:', error);
    return { success: false, message: 'Failed to update ticket status.' };
  }
}
