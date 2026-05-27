'use server'

import dbConnect from '@/database/mongodb'
import Client from '@/database/models/Client'
import Work from '@/database/models/Work'
import Payment from '@/database/models/Payment'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/session'

export async function getDatabaseDiagnostics() {
  const user = await getSessionUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  await dbConnect()
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("DB not connected");

    // Get database stats (global stats are ok for storage tracking, but we partition by user)
    const stats = await db.stats();
    
    // Get document counts specifically for this logged-in user
    const clientCount = await Client.countDocuments({ userId: user._id });
    const workCount = await Work.countDocuments({ userId: user._id });
    const paymentCount = await Payment.countDocuments({ userId: user._id });

    // Format storage (usually Atlas free tier is 512MB)
    const storageUsedMB = (stats.storageSize / (1024 * 1024)).toFixed(2);
    const dataSizeMB = (stats.dataSize / (1024 * 1024)).toFixed(2);
    
    return {
      success: true,
      stats: {
        dbName: stats.db,
        collections: stats.collections,
        totalObjects: stats.objects,
        avgObjectSize: (stats.avgObjSize).toFixed(2) + " bytes",
        dataSizeMB,
        storageUsedMB,
        indexSizeMB: (stats.indexSize / (1024 * 1024)).toFixed(2),
      },
      counts: {
        clients: clientCount,
        works: workCount,
        payments: paymentCount,
      }
    };
  } catch (error: unknown) {
    console.error("Diagnostic error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function wipeDatabaseAction() {
  const user = await getSessionUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  await dbConnect()
  try {
    // Delete only documents belonging to this user
    await Promise.all([
      Client.deleteMany({ userId: user._id }),
      Work.deleteMany({ userId: user._id }),
      Payment.deleteMany({ userId: user._id }),
    ]);

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/reports')
    revalidatePath('/dashboard/diagnostics')
    
    return { success: true, message: 'Your workspace data has been successfully wiped.' };
  } catch (error: unknown) {
    console.error("Wipe error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function resetWorkspaceAction() {
  const user = await getSessionUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  await dbConnect()
  try {
    // Delete only works and payments belonging to this user
    await Promise.all([
      Work.deleteMany({ userId: user._id }),
      Payment.deleteMany({ userId: user._id }),
    ]);

    // Reset client totalEarned if needed for this user's clients
    await Client.updateMany({ userId: user._id }, { totalEarned: 0 });

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/work')
    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/reports')
    revalidatePath('/dashboard/diagnostics')
    
    return { success: true, message: 'Tasks and Payments cleared for your account. Clients preserved.' };
  } catch (error: unknown) {
    console.error("Reset error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
