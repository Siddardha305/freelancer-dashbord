'use server'

import dbConnect from '@/database/mongodb';
import LeaveRequest from '@/dashboard/corporate/models/LeaveRequest';
import User from '@/database/models/User';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function applyLeaveAction(dateStr: string, reason: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  try {
    const leaveDate = new Date(dateStr);
    
    // Check if there is already a leave request for this date
    const startOfDay = new Date(leaveDate.setHours(0,0,0,0));
    const endOfDay = new Date(leaveDate.setHours(23,59,59,999));

    const existingRequest = await LeaveRequest.findOne({
      userId: user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingRequest) {
      return { success: false, message: 'You have already requested leave for this date.' };
    }

    // Create leave request
    await LeaveRequest.create({
      userId: user.id,
      workspaceId: user.workspaceId,
      date: new Date(dateStr),
      reason,
      status: 'pending',
    });

    revalidatePath('/dashboard/work');
    revalidatePath('/dashboard/team');
    return { success: true, message: 'Leave request submitted successfully!' };
  } catch (error) {
    console.error('Error applying for leave:', error);
    return { success: false, message: 'Failed to submit leave request.' };
  }
}

export async function getLeaveRequestsAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.', leaves: [] };
  }

  try {
    const isOwnerOrAdmin = user.teamRole === 'owner' || user.teamRole === 'admin' || !user.teamRole;
    
    let query = {};
    if (isOwnerOrAdmin) {
      // Get all requests in the active workspace
      query = { workspaceId: user.workspaceId };
    } else {
      // Employees see only their own requests
      query = { userId: user.id };
    }

    // Make sure User model is registered
    const leaves = await LeaveRequest.find(query)
      .populate({ path: 'userId', model: User, select: 'name email' })
      .sort({ date: -1 })
      .lean();

    // Map _id to id for serialization convenience
    const formattedLeaves = leaves.map((l: any) => ({
      id: l._id.toString(),
      userId: l.userId ? {
        id: l.userId._id.toString(),
        name: l.userId.name,
        email: l.userId.email,
      } : null,
      workspaceId: l.workspaceId.toString(),
      date: l.date.toISOString(),
      reason: l.reason,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    return { success: true, leaves: formattedLeaves };
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return { success: false, message: 'Failed to load leave requests.', leaves: [] };
  }
}

export async function approveLeaveAction(leaveId: string, status: 'approved' | 'rejected') {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  const isOwnerOrAdmin = user.teamRole === 'owner' || user.teamRole === 'admin' || !user.teamRole;
  if (!isOwnerOrAdmin) {
    return { success: false, message: 'Only workspace owners or admins can approve leave requests.' };
  }

  try {
    const request = await LeaveRequest.findOneAndUpdate(
      { _id: leaveId, workspaceId: user.workspaceId },
      { status },
      { new: true }
    );

    if (!request) {
      return { success: false, message: 'Leave request not found.' };
    }

    revalidatePath('/dashboard/work');
    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard/reports');
    return { success: true, message: `Leave request status updated to ${status}.` };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return { success: false, message: 'Failed to update leave request status.' };
  }
}
