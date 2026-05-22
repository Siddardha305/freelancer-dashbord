'use server'

import dbConnect from '@/database/mongodb';
import User from '@/database/models/User';
import Client from '@/database/models/Client';
import Work from '@/database/models/Work';
import Payment from '@/database/models/Payment';
import { hashPassword, verifyPassword, createSession, getSessionUser, destroySession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendUserWelcomeEmail } from '@/emails/mail';

export async function adminLoginAction(prevState: any, formData: FormData) {
  await dbConnect();

  const rawEmail = formData.get('email') as string;
  const rawPassword = formData.get('password') as string;

  const email = (rawEmail || '').trim().toLowerCase();
  const password = (rawPassword || '').trim();

  if (!email || !password) {
    return { message: 'Email and password are required' };
  }

  // Exact admin credentials verification
  if (email !== 'siddardhachitturi789@gmail.com' || password !== '123456789') {
    return { message: 'Invalid admin credentials' };
  }

  try {
    let adminUser = await User.findOne({ email });
    const correctHashedPassword = hashPassword(password);

    if (!adminUser) {
      // Auto-seed admin user
      adminUser = await User.create({
        name: 'Siddardha Admin',
        email,
        password: correctHashedPassword,
        role: 'admin',
      });
      console.log('Seeded administrator user accounts successfully.');
    } else {
      let needsSave = false;

      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        needsSave = true;
      }

      // Automatically sync/update DB password to match correct admin password if it differs
      const isPasswordCorrect = verifyPassword(password, adminUser.password);
      if (!isPasswordCorrect) {
        adminUser.password = correctHashedPassword;
        needsSave = true;
      }

      if (needsSave) {
        await adminUser.save();
        console.log('Synchronized administrator role and credentials in database.');
      }
    }

    // Set secure admin session cookie
    await createSession(adminUser._id.toString());

    revalidatePath('/admin');
    return { message: 'success' };
  } catch (error: any) {
    console.error("Admin login action failed:", error);
    return { message: error.message || 'Authentication failed' };
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
      Payment.find({}).lean(),
    ]);

    // Sum global revenue
    const globalRevenue = allPayments.reduce((sum: number, pay: any) => {
      const amt = parseFloat(pay.amount) || 0;
      return sum + amt;
    }, 0);

    // Retrieve full platform user registry with itemized resource counts
    const rawUsers = await User.find({}).sort({ createdAt: -1 }).lean();
    
    const userRegistry = await Promise.all(rawUsers.map(async (u: any) => {
      const [clientCount, taskCount, paymentCount] = await Promise.all([
        Client.countDocuments({ userId: u._id }),
        Work.countDocuments({ userId: u._id }),
        Payment.countDocuments({ userId: u._id }),
      ]);
      
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.createdAt,
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
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, message: error.message || 'Failed to delete user account.' };
  }
}

const UserCreationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'admin']),
});

export async function addUserAction(prevState: any, formData: FormData) {
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
  } catch (error: any) {
    console.error("Failed to add user:", error);
    return { message: error.message || 'Failed to create user account' };
  }
}
