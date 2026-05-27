'use server'

import crypto from 'crypto';
import dbConnect from '@/database/mongodb';
import User from '@/database/models/User';
import Client from '@/database/models/Client';
import Work from '@/database/models/Work';
import Payment from '@/database/models/Payment';
import { hashPassword, verifyPassword, createSession, destroySession, getSessionUser } from '@/lib/session';
import { sendUserWelcomeEmail, sendPasswordResetEmail } from '@/emails/mail';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendSlackNotification } from '@/lib/slack';

const AuthSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function loginAction(prevState: unknown, formData: FormData) {
  await dbConnect();
  
  const rawEmail = formData.get('email') as string;
  const email = (rawEmail || '').trim().toLowerCase();
  const password = formData.get('password') as string;
  
  const validatedFields = AuthSchema.safeParse({ email, password });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'Invalid email or password' };
    }
    
    const isPasswordCorrect = verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      return { message: 'Invalid email or password' };
    }

    // Transparent PBKDF2 upgrade: if password was hashed with old iteration count, re-hash silently
    const parts = user.password.split(':');
    if (parts.length === 2) {
      // Old format (salt:hash with 1000 iterations) — upgrade on login
      try {
        const { hashPassword } = await import('@/lib/session');
        await User.findByIdAndUpdate(user._id, { password: hashPassword(password) });
      } catch {
        // Non-blocking: if upgrade fails, user still logs in fine with old hash
      }
    }
    
    await createSession(user._id.toString());
    
    // We will handle redirect client-side or server-side
    // Revalidate dashboard routes
    revalidatePath('/dashboard');
    return { message: 'success' };
  } catch (error) {
    console.error("Login action error:", error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return { message };
  }
}

export async function signupAction(prevState: unknown, formData: FormData) {
  await dbConnect();
  
  const name = formData.get('name') as string;
  const rawEmail = formData.get('email') as string;
  const email = (rawEmail || '').trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  if (password !== confirmPassword) {
    return {
      errors: { confirmPassword: ['Passwords do not match'] },
      message: 'Validation Error',
    };
  }
  
  const validatedFields = AuthSchema.safeParse({ name, email, password });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }
  
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { message: 'An account with this email already exists' };
    }
    
    // Check if this is the very first user (for seamless legacy data migration)
    const totalUsers = await User.countDocuments();
    
    const hashedPassword = hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    
    // Seamless Migration:
    // If this is the very first user, they inherit any existing Clients/Tasks/Payments in the DB.
    // This preserves existing mock data so you don't lose anything on your first login!
    // Subsequent users get a completely fresh, empty dashboard.
    if (totalUsers === 0) {
      await Promise.all([
        Client.updateMany({ userId: { $exists: false } }, { userId: newUser._id }),
        Work.updateMany({ userId: { $exists: false } }, { userId: newUser._id }),
        Payment.updateMany({ userId: { $exists: false } }, { userId: newUser._id }),
      ]);
      console.log('Migrated legacy database records to first registered user.');
    }
    
    await createSession(newUser._id.toString());
    
    // Trigger onboarding welcome email asynchronously without blocking registration flow
    try {
      await sendUserWelcomeEmail(newUser.email, newUser.name);
    } catch (mailError) {
      console.error("Non-blocking signup welcome email dispatch failed:", mailError);
    }
    
    revalidatePath('/dashboard');
    return { message: 'success' };
  } catch (error) {
    console.error("Signup action error:", error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return { message };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

export async function getCurrentUserAction() {
  return await getSessionUser();
}

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  await dbConnect();
  
  const rawEmail = formData.get('email') as string;
  const email = (rawEmail || '').trim().toLowerCase();
  
  const EmailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });
  
  const validatedFields = EmailSchema.safeParse({ email });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Cryptographically secure token generation
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour token expiration
      
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
      
      // Dispatch password reset email
      await sendPasswordResetEmail(user.email, token);
    }
    
    // Always return success to prevent user email enumeration security issues
    return { message: 'success' };
  } catch (error) {
    console.error("Forgot password server action failed:", error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    return { message };
  }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  await dbConnect();
  
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  if (!token) {
    return { message: 'Password reset token is missing or invalid' };
  }
  
  if (password !== confirmPassword) {
    return {
      errors: { confirmPassword: ['Passwords do not match'] },
      message: 'Validation Error',
    };
  }
  
  const PasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
  
  const validatedFields = PasswordSchema.safeParse({ password });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }
  
  try {
    // Find non-expired token in MongoDB
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    
    if (!user) {
      return { message: 'Password reset link is invalid or has expired' };
    }
    
    // Hash new password using session module
    user.password = hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    return { message: 'success' };
  } catch (error) {
    console.error("Reset password server action failed:", error);
    const message = error instanceof Error ? error.message : 'Failed to update your password. Please try again.';
    return { message };
  }
}

export async function updateProfileAction(data: { 
  name: string; 
  email: string; 
  bio?: string; 
  currency?: string;
  agencyName?: string;
  agencyLogoUrl?: string;
  agencyLogoDarkUrl?: string;
  agencyBrandingMode?: string;
}) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const rawEmail = data.email.trim().toLowerCase();
    
    // Validate email format
    const EmailSchema = z.string().email("Please enter a valid email address");
    const validatedEmail = EmailSchema.safeParse(rawEmail);
    if (!validatedEmail.success) {
      return { success: false, message: 'Invalid email address' };
    }

    if (data.name.trim().length < 2) {
      return { success: false, message: 'Name must be at least 2 characters' };
    }

    // Server-side logo size validation (2MB limit = ~2.73MB base64 string)
    const MAX_LOGO_SIZE = 2_800_000; // ~2MB binary in base64
    if (data.agencyLogoUrl && data.agencyLogoUrl.length > MAX_LOGO_SIZE) {
      return { success: false, message: 'Light logo image exceeds the 2MB size limit' };
    }
    if (data.agencyLogoDarkUrl && data.agencyLogoDarkUrl.length > MAX_LOGO_SIZE) {
      return { success: false, message: 'Dark logo image exceeds the 2MB size limit' };
    }

    // Check email uniqueness if it changed
    if (rawEmail !== user.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: rawEmail });
      if (existingUser) {
        return { success: false, message: 'An account with this email already exists' };
      }
    }

    await User.findByIdAndUpdate(user.id || user._id, {
      name: data.name.trim(),
      email: rawEmail,
      bio: (data.bio || '').trim(),
      currency: data.currency || 'INR',
      agencyName: data.agencyName ? data.agencyName.trim() : null,
      agencyLogoUrl: data.agencyLogoUrl ? data.agencyLogoUrl.trim() : null,
      agencyLogoDarkUrl: data.agencyLogoDarkUrl ? data.agencyLogoDarkUrl.trim() : null,
      agencyBrandingMode: data.agencyBrandingMode || 'both',
    });

    revalidatePath('/dashboard', 'layout');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error("Update profile error:", error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, message };
  }
}

export async function updatePasswordAction(data: { currentPassword?: string; newPassword?: string }) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!data.currentPassword || !data.newPassword) {
    return { success: false, message: 'Missing password fields' };
  }

  try {
    const dbUser = await User.findById(user.id || user._id);
    if (!dbUser) {
      return { success: false, message: 'User not found' };
    }

    // Verify current password
    const isPasswordCorrect = verifyPassword(data.currentPassword, dbUser.password);
    if (!isPasswordCorrect) {
      return { success: false, message: 'Incorrect current password' };
    }

    if (data.newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }

    // Hash and save new password
    dbUser.password = hashPassword(data.newPassword);
    await dbUser.save();

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error("Update password error:", error);
    const message = error instanceof Error ? error.message : 'Failed to update password';
    return { success: false, message };
  }
}

export async function updateUserPlanSelfAction() {
  return { success: false, message: 'Plan changes can only be managed by system administrators in the System Console.' };
}

export async function updateSlackWebhookAction(webhookUrl: string | null) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  // Validate webhook URL if not null
  if (webhookUrl && !webhookUrl.startsWith("https://hooks.slack.com/services/")) {
    return { success: false, message: 'Invalid Slack webhook URL format. It must start with https://hooks.slack.com/services/' };
  }

  try {
    await User.findByIdAndUpdate(user.id || user._id, { slackWebhookUrl: webhookUrl || null });
    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Slack Webhook URL updated successfully.' };
  } catch (error) {
    console.error('Failed to update Slack webhook URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to update webhook URL.';
    return { success: false, message };
  }
}

export async function testSlackWebhookAction(webhookUrl: string) {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/services/")) {
    return { success: false, message: 'Invalid Slack webhook URL format.' };
  }

  try {
    const res = await sendSlackNotification({
      webhookUrl,
      title: "🔌 Slack Integration Test Connection",
      text: `Hello *${user.name || 'User'}*! Your FreelanceOS Slack Webhook integration is working perfectly!`,
      color: "#4f46e5",
      fields: [
        { title: "Status", value: "Active / Verified", short: true },
        { title: "Workspace", value: user.email, short: true },
      ],
    });

    if (res.success) {
      return { success: true, message: 'Test message sent to Slack successfully!' };
    } else {
      return { success: false, message: res.error || 'Failed to dispatch Slack test message.' };
    }
  } catch (error) {
    console.error('Slack webhook test connection failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to connect to Slack webhook.';
    return { success: false, message };
  }
}


