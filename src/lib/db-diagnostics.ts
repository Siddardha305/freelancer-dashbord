'use server'

import dbConnect from '@/lib/mongodb'
import Client from '@/models/Client'
import Work from '@/models/Work'
import Payment from '@/models/Payment'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'

export async function getDatabaseDiagnostics() {
  await dbConnect()
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("DB not connected");

    // Get database stats
    const stats = await db.stats();
    
    // Get document counts
    const clientCount = await Client.countDocuments();
    const workCount = await Work.countDocuments();
    const paymentCount = await Payment.countDocuments();

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
  } catch (error: any) {
    console.error("Diagnostic error:", error);
    return { success: false, error: error.message };
  }
}

export async function wipeDatabaseAction() {
  await dbConnect()
  try {
    // Delete all documents from all collections
    await Promise.all([
      Client.deleteMany({}),
      Work.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    revalidatePath('/')
    revalidatePath('/clients')
    revalidatePath('/work')
    revalidatePath('/payments')
    revalidatePath('/reports')
    revalidatePath('/diagnostics')
    
    return { success: true, message: 'All data has been successfully wiped.' };
  } catch (error: any) {
    console.error("Wipe error:", error);
    return { success: false, error: error.message };
  }
}
