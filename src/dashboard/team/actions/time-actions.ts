'use server'

import dbConnect from '@/database/mongodb';
import TimeLog from '@/database/models/TimeLog';
import { getSessionUser } from '@/lib/session';
import User from '@/database/models/User';
import { revalidatePath } from 'next/cache';

export async function clockInAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  try {
    // Check if there is already an active log
    const activeLog = await TimeLog.findOne({
      userId: user.id,
      status: 'active',
    });

    if (activeLog) {
      return { success: false, message: 'You are already clocked in.' };
    }

    // Create a new log
    await TimeLog.create({
      userId: user.id,
      workspaceId: user.workspaceId,
      clockIn: new Date(),
      status: 'active',
    });

    revalidatePath('/dashboard/work');
    return { success: true, message: 'Successfully clocked in!' };
  } catch (error) {
    console.error('Error clocking in:', error);
    return { success: false, message: 'Failed to clock in.' };
  }
}

export async function clockOutAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  try {
    // Find the active log
    const activeLog = await TimeLog.findOne({
      userId: user.id,
      status: 'active',
    });

    if (!activeLog) {
      return { success: false, message: 'No active clock-in session found.' };
    }

    const clockOutTime = new Date();
    const diffMs = clockOutTime.getTime() - new Date(activeLog.clockIn).getTime();
    const durationMinutes = Math.max(Math.round(diffMs / (1000 * 60)), 1);

    activeLog.clockOut = clockOutTime;
    activeLog.durationMinutes = durationMinutes;
    activeLog.status = 'completed';
    await activeLog.save();

    revalidatePath('/dashboard/work');
    return { success: true, message: 'Successfully clocked out!' };
  } catch (error) {
    console.error('Error clocking out:', error);
    return { success: false, message: 'Failed to clock out.' };
  }
}

export async function getActiveTimeLogAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    const activeLog = await TimeLog.findOne({
      userId: user.id,
      status: 'active',
    }).lean();

    return { 
      success: true, 
      log: activeLog ? JSON.parse(JSON.stringify(activeLog)) : null 
    };
  } catch (error) {
    console.error('Error fetching active time log:', error);
    return { success: false, message: 'Failed to get active log.' };
  }
}

export async function getTimeLogsAction(employeeId?: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    let query: Record<string, any> = {};

    if (employeeId) {
      // Manager checking an employee's logs: check if owner/admin
      if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
        return { success: false, message: 'Access denied.' };
      }
      query = {
        userId: employeeId,
        workspaceId: user.workspaceId,
      };
    } else {
      // Employee checking their own logs
      query = {
        userId: user.id,
      };
    }

    const logs = await TimeLog.find(query).sort({ clockIn: -1 }).limit(100).lean();

    return { 
      success: true, 
      logs: JSON.parse(JSON.stringify(logs)) 
    };
  } catch (error) {
    console.error('Error fetching time logs:', error);
    return { success: false, message: 'Failed to get time logs.' };
  }
}

export async function getAllTimeLogsAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized.', logs: [] };
  }
  const isCorp = user.workspaceType === 'corporate';
  if (!isCorp && user.teamRole !== 'owner' && user.teamRole !== 'admin') {
    return { success: false, message: 'Access denied.', logs: [] };
  }

  try {
    const logs = await TimeLog.find({ workspaceId: user.workspaceId })
      .populate({ path: 'userId', model: User, select: 'name email' })
      .sort({ clockIn: -1 })
      .lean();

    const formattedLogs = logs.map((log: any) => ({
      id: log._id.toString(),
      userId: log.userId ? {
        id: log.userId._id.toString(),
        name: log.userId.name,
        email: log.userId.email,
      } : null,
      clockIn: log.clockIn.toISOString(),
      clockOut: log.clockOut ? log.clockOut.toISOString() : null,
      durationMinutes: log.durationMinutes,
      status: log.status,
      workspaceId: log.workspaceId.toString(),
    }));

    return { 
      success: true, 
      logs: formattedLogs
    };
  } catch (error) {
    console.error('Error fetching all time logs:', error);
    return { success: false, message: 'Failed to get all time logs.', logs: [] };
  }
}
