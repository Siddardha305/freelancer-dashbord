'use server'

import dbConnect from '@/database/mongodb';
import ContactMessage from '@/database/models/ContactMessage';
import { z } from 'zod';

const ContactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function submitContactAction(name: string, email: string, message: string) {
  await dbConnect();

  const validated = ContactSubmissionSchema.safeParse({ name, email, message });
  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0] || 'Validation error';
    return { success: false, message: firstError };
  }

  try {
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });
    return { success: true, message: 'Message logged successfully.' };
  } catch (error) {
    console.error('Contact form submission failed:', error);
    const msg = error instanceof Error ? error.message : 'Failed to send message';
    return { success: false, message: msg };
  }
}
