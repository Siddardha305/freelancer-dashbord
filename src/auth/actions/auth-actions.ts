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

const AuthSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function loginAction(prevState: any, formData: FormData) {
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
    
    await createSession(user._id.toString());
    
    // We will handle redirect client-side or server-side
    // Revalidate dashboard routes
    revalidatePath('/dashboard');
    return { message: 'success' };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { message: error.message || 'Authentication failed' };
  }
}

export async function signupAction(prevState: any, formData: FormData) {
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
  } catch (error: any) {
    console.error("Signup action error:", error);
    return { message: error.message || 'Registration failed' };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

export async function getCurrentUserAction() {
  return await getSessionUser();
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
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
  } catch (error: any) {
    console.error("Forgot password server action failed:", error);
    return { message: error.message || 'An unexpected error occurred. Please try again.' };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
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
  } catch (error: any) {
    console.error("Reset password server action failed:", error);
    return { message: error.message || 'Failed to update your password. Please try again.' };
  }
}

export async function updateProfileAction(data: { name: string; email: string; bio?: string; currency?: string }) {
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
    });

    revalidatePath('/dashboard');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, message: error.message || 'Failed to update profile' };
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
  } catch (error: any) {
    console.error("Update password error:", error);
    return { success: false, message: error.message || 'Failed to update password' };
  }
}

