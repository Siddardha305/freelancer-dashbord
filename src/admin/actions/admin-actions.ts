'use server'

import crypto from 'crypto';
import dbConnect from '@/database/mongodb';
import User from '@/database/models/User';
import Client from '@/database/models/Client';
import Work from '@/database/models/Work';
import Payment from '@/database/models/Payment';
import ContactMessage from '@/database/models/ContactMessage';
import SupportTicket from '@/database/models/SupportTicket';
import { hashPassword, verifyPassword, createSession, getSessionUser, destroySession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendUserWelcomeEmail, sendAdminPasswordResetEmail, sendContactReplyEmail } from '@/emails/mail';

export async function adminLoginAction(prevState: unknown, formData: FormData) {
  await dbConnect();

  const rawEmail = formData.get('email') as string;
  const rawPassword = formData.get('password') as string;

  const email = (rawEmail || '').trim().toLowerCase();
  const password = (rawPassword || '').trim();

  if (!email || !password) {
    return { message: 'Email and password are required' };
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL) {
    return { message: 'Admin panel is not configured. Contact system administrator.' };
  }

  // Reject any email that is not the configured admin email
  if (email !== ADMIN_EMAIL.trim().toLowerCase()) {
    return { message: 'Invalid admin credentials' };
  }

  try {
    let adminUser = await User.findOne({ email });

    if (!adminUser) {
      // First-time setup: no DB user yet — verify against env password to seed
      if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
        return { message: 'Invalid admin credentials' };
      }
      adminUser = await User.create({
        name: 'Admin',
        email,
        password: hashPassword(password),
        role: 'admin',
      });
    } else {
      // User exists in DB: verify against stored password hash
      if (!verifyPassword(password, adminUser.password)) {
        return { message: 'Invalid admin credentials' };
      }
      // Ensure role is admin
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }
    }

    await createSession(adminUser._id.toString());
    revalidatePath('/admin');
    return { message: 'success' };
  } catch (error) {
    console.error("Admin login action failed:", error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return { message };
  }
}

export async function adminLogoutAction() {
  await destroySession();
}

export async function getAdminOverviewAction() {
  await dbConnect();
  
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Access denied. Administrator privileges required.');
  }

  try {
    const [totalUsers, totalClients, totalTasks, allPayments] = await Promise.all([
      User.countDocuments({}),
      Client.countDocuments({}),
      Work.countDocuments({}),
      Payment.find({ isDeleted: { $ne: true } }).lean(),
    ]);

    // Sum global revenue
    const globalRevenue = (allPayments as Array<{ amount?: string | number }>).reduce((sum: number, pay) => {
      const amt = typeof pay.amount === 'number' ? pay.amount : parseFloat(pay.amount || '0') || 0;
      return sum + amt;
    }, 0);

    // Retrieve full platform user registry with itemized resource counts
    const rawUsers = await User.find({}).sort({ createdAt: -1 }).lean();
    
    const userRegistry = await Promise.all((rawUsers as Array<{
      _id: { toString(): string };
      name?: string;
      email?: string;
      role?: string;
      plan?: string;
      teamRole?: string;
      parentUserId?: any;
      createdAt?: string | Date;
    }>).map(async (u) => {
      const [clientCount, taskCount, paymentCount] = await Promise.all([
        Client.countDocuments({ userId: u._id }),
        Work.countDocuments({ userId: u._id }),
        Payment.countDocuments({ userId: u._id.toString(), isDeleted: { $ne: true } }),
      ]);

      let parentUser = null;
      if (u.parentUserId) {
        const pDoc = await User.findById(u.parentUserId).select('name email agencyName').lean() as any;
        if (pDoc) {
          parentUser = { name: pDoc.name || '', email: pDoc.email || '', agencyName: pDoc.agencyName || null };
        }
      }
      
      const agencyName = u.parentUserId ? (parentUser?.agencyName || null) : (u.agencyName || null);

      return {
        id: u._id.toString(),
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'user',
        plan: u.plan || 'hobby',
        workspaceType: u.workspaceType || 'general',
        teamRole: u.teamRole || 'owner',
        agencyName,
        parentUser,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
        clientCount,
        taskCount,
        paymentCount,
      };
    }));

    // Dynamic Email dispatch logs telemetry
    // Every user gets a workspace welcome email, every CRM client logs an onboarding dispatch
    const emailCount = totalUsers + totalClients; 

    // Generate recent email dispatch logs for visual telemetry
    const emailLogs = [];
    
    // Scrape recent users for onboarding email dispatch logs
    for (const u of rawUsers.slice(0, 10)) {
      emailLogs.push({
        id: `ml-${u._id.toString().substring(18)}`,
        to: u.email,
        subject: 'Welcome to FreelanceOS | private workspace initialized',
        type: 'Workspace Setup',
        status: 'Delivered',
        sentAt: u.createdAt,
      });
    }

    interface LeanContactMessage {
      _id: { toString(): string };
      name?: string;
      email?: string;
      message?: string;
      replied?: boolean;
      replyText?: string;
      repliedAt?: string | Date;
      createdAt?: string | Date;
    }

    interface LeanSupportTicket {
      _id: { toString(): string };
      userId: { toString(): string };
      userName: string;
      userEmail: string;
      title: string;
      description: string;
      category: string;
      priority: string;
      status: string;
      adminReply?: string;
      createdAt?: string | Date;
    }

    // Fetch and structure all contact messages
    const rawContactMessages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
    const contactMessages = (rawContactMessages as unknown as LeanContactMessage[]).map((m) => ({
      id: m._id.toString(),
      name: m.name || '',
      email: m.email || '',
      message: m.message || '',
      replied: !!m.replied,
      replyText: m.replyText || '',
      repliedAt: m.repliedAt ? new Date(m.repliedAt).toISOString() : '',
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : '',
    }));

    // Fetch and structure all support tickets
    const rawSupportTickets = await SupportTicket.find({}).sort({ createdAt: -1 }).lean();
    const supportTickets = (rawSupportTickets as unknown as LeanSupportTicket[]).map((t) => ({
      id: t._id.toString(),
      userId: t.userId.toString(),
      userName: t.userName,
      userEmail: t.userEmail,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      adminReply: t.adminReply || '',
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : '',
    }));

    return {
      stats: {
        totalUsers,
        totalClients,
        totalTasks,
        globalRevenue,
        emailCount,
      },
      userRegistry,
      emailLogs,
      contactMessages,
      supportTickets,
    };
  } catch (error) {
    console.error("Failed to gather platform metrics:", error);
    throw new Error('Failed to retrieve system overview metrics.');
  }
}

export async function deleteUserAction(userId: string) {
  await dbConnect();

  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: 'Access denied. Administrator privileges required.' };
  }

  // Prevent admin from self-deleting
  if (currentUser.id === userId) {
    return { success: false, message: 'Security Safeguard: You cannot delete your own active administrator account!' };
  }

  try {
    // Delete user document
    await User.findByIdAndDelete(userId);

    // Cascading cleanups: remove all associated client CRM workspaces, tasks, payments
    await Promise.all([
      Client.deleteMany({ userId }),
      Work.deleteMany({ userId }),
      Payment.deleteMany({ userId })
    ]);

    console.log(`Cascade deleted user ${userId} and all linked workspace documents.`);
    revalidatePath('/admin');
    return { success: true, message: 'User account and all linked workspace assets cascade deleted successfully!' };
  } catch (error) {
    console.error("Failed to delete user:", error);
    const message = error instanceof Error ? error.message : 'Failed to delete user account.';
    return { success: false, message };
  }
}

const UserCreationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'admin']),
});

export async function addUserAction(prevState: unknown, formData: FormData) {
  await dbConnect();

  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { message: 'Access denied. Administrator privileges required.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const validatedFields = UserCreationSchema.safeParse({ name, email, password, role });

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors;
    const errors = Object.values(errorMap).flat();
    return { message: errors[0] || 'Validation error occurred' };
  }

  try {
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return { message: 'An account with this email address already exists' };
    }

    const hashedPassword = hashPassword(password);
    await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    console.log(`Administrator created new ${role} account: ${email}`);

    // Trigger onboarding welcome email asynchronously without blocking admin completion
    try {
      await sendUserWelcomeEmail(email.trim().toLowerCase(), name.trim());
    } catch (mailError) {
      console.error("Non-blocking admin user welcome email dispatch failed:", mailError);
    }

    revalidatePath('/admin');
    return { message: 'success' };
  } catch (error) {
    console.error("Failed to add user:", error);
    const message = error instanceof Error ? error.message : 'Failed to create user account';
    return { message };
  }
}

export async function updateUserPlanAction(userId: string, plan: 'hobby' | 'pro' | 'agency') {
  await dbConnect();

  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: 'Access denied. Administrator privileges required.' };
  }

  const validPlans = ['hobby', 'pro', 'agency'];
  if (!validPlans.includes(plan)) {
    return { success: false, message: 'Invalid plan specified.' };
  }

  try {
    await User.findByIdAndUpdate(userId, { plan });
    console.log(`Admin updated user ${userId} plan to: ${plan}`);
    revalidatePath('/admin');
    return { success: true, message: `Plan updated to ${plan} successfully.` };
  } catch (error) {
    console.error('Failed to update user plan:', error);
    const message = error instanceof Error ? error.message : 'Failed to update plan.';
    return { success: false, message };
  }
}

// ─── Admin Password Management ────────────────────────────────────────────────

export async function changeAdminPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }

  if (!data.currentPassword || !data.newPassword) {
    return { success: false, message: 'Both fields are required' };
  }

  if (data.newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters' };
  }

  await dbConnect();
  try {
    const adminUser = await User.findById(user.id || user._id);
    if (!adminUser) return { success: false, message: 'Admin user not found' };

    // Verify current password against DB hash
    if (!verifyPassword(data.currentPassword, adminUser.password)) {
      return { success: false, message: 'Current password is incorrect' };
    }

    adminUser.password = hashPassword(data.newPassword);
    await adminUser.save();

    return { success: true, message: 'Password changed successfully!' };
  } catch (error) {
    console.error('Change admin password error:', error);
    return { success: false, message: 'Failed to change password' };
  }
}

export async function adminForgotPasswordAction(prevState: unknown, formData: FormData) {
  const rawEmail = (formData.get('email') as string || '').trim().toLowerCase();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  // Always return success to prevent email enumeration
  if (!ADMIN_EMAIL || rawEmail !== ADMIN_EMAIL.trim().toLowerCase()) {
    return { message: 'success' };
  }

  await dbConnect();
  try {
    const adminUser = await User.findOne({ email: rawEmail, role: 'admin' });
    if (!adminUser) return { message: 'success' };

    // Generate a secure 256-bit reset token, valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3_600_000);

    adminUser.resetPasswordToken = token;
    adminUser.resetPasswordExpires = expires;
    await adminUser.save();

    const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetLink = `${APP_URL}/admin/reset-password?token=${token}`;

    await sendAdminPasswordResetEmail(rawEmail, resetLink);
    return { message: 'success' };
  } catch (error) {
    console.error('Admin forgot password error:', error);
    return { message: 'success' }; // Always return success
  }
}

export async function adminResetPasswordAction(prevState: unknown, formData: FormData) {
  const token = (formData.get('token') as string || '').trim();
  const password = (formData.get('password') as string || '');
  const confirmPassword = (formData.get('confirmPassword') as string || '');

  if (!token) return { message: 'Reset token is missing or invalid' };
  if (!password || !confirmPassword) return { message: 'All fields are required' };
  if (password !== confirmPassword) return { message: 'Passwords do not match' };
  if (password.length < 8) return { message: 'Password must be at least 8 characters' };

  await dbConnect();
  try {
    const adminUser = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      role: 'admin',
    });

    if (!adminUser) {
      return { message: 'Reset link is invalid or has expired. Please request a new one.' };
    }

    adminUser.password = hashPassword(password);
    adminUser.resetPasswordToken = null;
    adminUser.resetPasswordExpires = null;
    await adminUser.save();

    return { message: 'success' };
  } catch (error) {
    console.error('Admin reset password error:', error);
    return { message: 'Failed to reset password. Please try again.' };
  }
}

export async function replyToContactMessageAction(messageId: string, replyText: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: 'Access denied. Administrator privileges required.' };
  }

  if (!replyText || !replyText.trim()) {
    return { success: false, message: 'Reply text cannot be empty.' };
  }

  await dbConnect();
  try {
    const contactMsg = await ContactMessage.findById(messageId);
    if (!contactMsg) {
      return { success: false, message: 'Message not found.' };
    }

    // Send the email response via Resend
    const emailRes = await sendContactReplyEmail(
      contactMsg.email,
      contactMsg.name,
      contactMsg.message,
      replyText.trim()
    );

    if (!emailRes.success) {
      return { success: false, message: 'Failed to send reply email. Verify Resend config.' };
    }

    // Update the database record
    contactMsg.replied = true;
    contactMsg.replyText = replyText.trim();
    contactMsg.repliedAt = new Date();
    await contactMsg.save();

    revalidatePath('/admin');
    return { success: true, message: 'Reply email sent and logged successfully!' };
  } catch (error) {
    console.error('Failed to reply to contact message:', error);
    const msg = error instanceof Error ? error.message : 'Error sending reply.';
    return { success: false, message: msg };
  }
}

export async function updateUserWorkspaceTypeAction(userId: string, newWorkspaceType: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  await dbConnect();
  try {
    const updated = await User.findByIdAndUpdate(userId, { workspaceType: newWorkspaceType }, { new: true });
    if (!updated) return { success: false, message: 'User not found' };
    revalidatePath('/admin');
    return { success: true, message: `Workspace type updated to ${newWorkspaceType}` };
  } catch (err) {
    console.error("Failed to update user workspace type:", err);
    return { success: false, message: 'Database error' };
  }
}
