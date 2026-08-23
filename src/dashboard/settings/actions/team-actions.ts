'use server'

import dbConnect from '@/database/mongodb';
import User from '@/database/models/User';
import { getSessionUser, hashPassword } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const InviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['admin', 'editor', 'viewer']),
  memberRate: z.number().optional().default(0),
  memberPaymentType: z.enum(['per_thumbnail', 'hourly', 'salary']).optional().default('per_thumbnail'),
});

/**
 * Fetches all registered team members associated with the active workspace
 */
export async function getTeamMembersAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) return [];

  // Workspace owners, admins, and editors/viewers can retrieve team members to resolve assignee names
  if (user.teamRole !== 'owner' && user.teamRole !== 'admin' && user.teamRole !== 'editor' && user.teamRole !== 'viewer') return [];

  try {
    const members = await User.find({
      $or: [
        { parentUserId: user.workspaceId },
        { _id: user.workspaceId }
      ]
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    interface LeanMemberDoc {
      _id: { toString(): string };
      name: string;
      email: string;
      teamRole: string;
      plan: string;
      workspaceType: string;
      createdAt: string | Date;
      updatedAt: string | Date;
    }

    return (JSON.parse(JSON.stringify(members)) as LeanMemberDoc[]).map((m) => ({
      ...m,
      id: m._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

/**
 * Invites and provisions a new team member account inside the owner's workspace
 */
export async function inviteTeamMemberAction(formData: {
  name: string;
  email: string;
  password?: string;
  role: string;
  memberRate?: number;
  memberPaymentType?: 'per_thumbnail' | 'hourly' | 'salary';
}) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // 1. Only the workspace owner can invite members
  if (user.teamRole !== 'owner') {
    return { success: false, message: 'Only the workspace owner is authorized to invite team members.' };
  }

  // 2. Strict Plan Validation: Exclusive to Agency Plan
  if (user.plan !== 'agency') {
    return { 
      success: false, 
      message: 'Workspace Sharing & Collaboration is exclusive to the Agency Plan. Please upgrade to invite team members.' 
    };
  }

  // Validate fields
  const validatedFields = InviteSchema.safeParse(formData);
  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.issues[0]?.message || 'Validation error';
    return { success: false, message: errorMsg };
  }

  const { name, email, password, role, memberRate, memberPaymentType } = validatedFields.data;
  const rawEmail = email.trim().toLowerCase();

  try {
    // 3. Confirm email uniqueness globally
    const existingUser = await User.findOne({ email: rawEmail });
    if (existingUser) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // 4. Secure password hashing
    const hashedPassword = hashPassword(password);

    // 5. Create team member user record
    await User.create({
      name: name.trim(),
      email: rawEmail,
      password: hashedPassword,
      parentUserId: user.workspaceId,
      teamRole: role,
      plan: 'agency', // Share owner's tier metadata
      workspaceType: user.workspaceType || 'general',
      memberRate,
      memberPaymentType,
    });

    revalidatePath('/dashboard/settings');
    return { success: true, message: `Successfully invited ${name} as a team ${role}!` };
  } catch (error) {
    console.error("Error inviting team member:", error);
    const message = error instanceof Error ? error.message : 'An error occurred during invitation';
    return { success: false, message };
  }
}

/**
 * Adjusts the role and permission levels of an existing team member
 */
export async function updateTeamMemberRoleAction(memberId: string, role: 'admin' | 'editor' | 'viewer') {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (user.teamRole !== 'owner') {
    return { success: false, message: 'Unauthorized permission level' };
  }

  try {
    const updated = await User.findOneAndUpdate(
      { _id: memberId, parentUserId: user.workspaceId },
      { teamRole: role },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: 'Team member not found or is outside your workspace.' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Team member role updated successfully.' };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, message: 'Failed to update team member role.' };
  }
}

/**
 * Removes a team member account and revokes their workspace access
 */
export async function deleteTeamMemberAction(memberId: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (user.teamRole !== 'owner') {
    return { success: false, message: 'Unauthorized permission level' };
  }

  try {
    const deleted = await User.findOneAndDelete({
      _id: memberId,
      parentUserId: user.workspaceId
    });

    if (!deleted) {
      return { success: false, message: 'Team member not found or is outside your workspace.' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true, message: `Successfully removed ${deleted.name} from your workspace.` };
  } catch (error) {
    console.error("Error deleting team member:", error);
    return { success: false, message: 'Failed to remove team member.' };
  }
}

/**
 * Adjusts the payout rate and payment structure of an existing team member
 */
export async function updateTeamMemberRateAction(
  memberId: string, 
  memberRate: number, 
  memberPaymentType: 'per_thumbnail' | 'hourly' | 'salary'
) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (user.teamRole !== 'owner') {
    return { success: false, message: 'Only the workspace owner can modify team member payout settings.' };
  }

  try {
    const updated = await User.findOneAndUpdate(
      { _id: memberId, parentUserId: user.workspaceId },
      { memberRate, memberPaymentType },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: 'Team member not found or is outside your workspace.' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Successfully updated payout rate settings.' };
  } catch (error) {
    console.error("Error updating member rate:", error);
    return { success: false, message: 'Failed to update member rate.' };
  }
}

/**
 * Gathers complete performance, task logs, and estimated payouts for a team member
 */
export async function getTeamMemberStatsAction(memberId: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
    throw new Error('Unauthorized');
  }

  try {
    const member = await User.findOne({
      _id: memberId,
      parentUserId: user.workspaceId
    }).select('-password').lean();

    if (!member) {
      throw new Error('Member not found or is outside your workspace.');
    }

    const Work = (await import('@/database/models/Work')).default;
    
    const tasks = await Work.find({
      assignedTo: memberId,
      userId: user.workspaceId
    }).sort({ completedAt: -1, createdAt: -1 }).lean();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Completed' || t.status === 'Done').length;
    const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress').length;
    const reviewTasks = tasks.filter((t: any) => t.status === 'Review').length;
    const todoTasks = tasks.filter((t: any) => t.status === 'To Do').length;

    const unpaidCompletedTasks = tasks.filter((t: any) => ((t.status === 'Completed' || t.status === 'Done') && !t.isPaid)).length;

    const unpaidHours = tasks
      .filter((t: any) => (t.status === 'Completed' || t.status === 'Done') && !t.isPaid)
      .reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0);

    const totalHours = tasks
      .filter((t: any) => t.status === 'Completed' || t.status === 'Done')
      .reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0);

    const rate = member.memberRate || 0;
    const pType = member.memberPaymentType || 'per_thumbnail';
    let estimatedPayout = 0;

    if (pType === 'per_thumbnail') {
      estimatedPayout = unpaidCompletedTasks * rate;
    } else if (pType === 'hourly') {
      estimatedPayout = unpaidHours * rate;
    } else if (pType === 'salary') {
      estimatedPayout = rate;
    }

     interface LeanWorkDoc {
      _id: { toString(): string };
      client: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      deadline: string;
      actualHours?: number;
      completedAt?: Date | string;
      isPaid?: boolean;
      isPaidByClient?: boolean;
    }

    const tasksList = (JSON.parse(JSON.stringify(tasks)) as LeanWorkDoc[]).map((t) => ({
      id: t._id.toString(),
      client: t.client,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      actualHours: t.actualHours || 0,
      completedAt: t.completedAt ? new Date(t.completedAt).toLocaleDateString() : null,
      isPaid: t.isPaid || false,
      isPaidByClient: t.isPaidByClient || false,
    }));

    return {
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        reviewTasks,
        todoTasks,
        totalHours,
        estimatedPayout,
        rate,
        paymentType: pType,
      },
      member: {
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        teamRole: member.teamRole,
        memberRate: member.memberRate || 0,
        memberPaymentType: member.memberPaymentType || 'per_thumbnail',
        color: member.color || '#6366F1',
      },
      tasks: tasksList,
    };
  } catch (error) {
    console.error("Error in getTeamMemberStatsAction:", error);
    throw new Error('Failed to fetch team member statistics');
  }
}

/**
 * Updates the associated color tag for a team member
 */
export async function updateTeamMemberColorAction(memberId: string, color: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
    return { success: false, message: 'Only workspace owners or admins can modify team member color settings.' };
  }

  try {
    const updated = await User.findOneAndUpdate(
      { _id: memberId, parentUserId: user.workspaceId },
      { color },
      { new: true }
    );

    if (!updated) {
      if (memberId === user.workspaceId) {
        const ownerUpdated = await User.findOneAndUpdate(
          { _id: memberId },
          { color },
          { new: true }
        );
        if (ownerUpdated) {
          revalidatePath('/dashboard/team');
          return { success: true, message: 'Successfully updated color tag.' };
        }
      }
      return { success: false, message: 'Team member not found.' };
    }

    revalidatePath('/dashboard/team');
    return { success: true, message: 'Successfully updated color tag.' };
  } catch (error) {
    console.error("Error updating member color:", error);
    return { success: false, message: 'Failed to update member color.' };
  }
}
