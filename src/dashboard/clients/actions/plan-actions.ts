'use server'

import dbConnect from '@/database/mongodb';
import PredefinedPlan from '@/database/models/PredefinedPlan';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all predefined plans for the active workspace.
 * Automatically seeds default plans if none exist yet.
 */
export async function getPredefinedPlansAction() {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) return [];

  try {
    let plans = await PredefinedPlan.find({ userId: user.workspaceId })
      .sort({ createdAt: 1 })
      .lean();

    // Auto-seed defaults if list is empty
    if (plans.length === 0) {
      const defaults = [
        { name: '7-10 Thumbnails per month (₹3,100)', thumbnailsCount: 10, pricePerUnit: 310, userId: user.workspaceId },
        { name: '12-15 Thumbnails per month (₹4,800)', thumbnailsCount: 15, pricePerUnit: 320, userId: user.workspaceId },
        { name: '17-20 Thumbnails per month (₹5,800)', thumbnailsCount: 20, pricePerUnit: 290, userId: user.workspaceId }
      ];
      await PredefinedPlan.insertMany(defaults);
      plans = await PredefinedPlan.find({ userId: user.workspaceId })
        .sort({ createdAt: 1 })
        .lean();
    }

    interface LeanPlanDoc {
      _id: { toString(): string };
      name: string;
      thumbnailsCount: number;
      pricePerUnit: number;
    }

    return (JSON.parse(JSON.stringify(plans)) as LeanPlanDoc[]).map((p) => ({
      id: p._id.toString(),
      name: p.name,
      thumbnailsCount: p.thumbnailsCount,
      pricePerUnit: p.pricePerUnit,
    }));
  } catch (error) {
    console.error("Error fetching predefined plans:", error);
    return [];
  }
}

/**
 * Adds a new predefined plan to the workspace
 */
export async function addPredefinedPlanAction(name: string, thumbnailsCount: number, pricePerUnit: number) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const plan = new PredefinedPlan({
      userId: user.workspaceId,
      name,
      thumbnailsCount,
      pricePerUnit,
    });
    await plan.save();

    revalidatePath('/dashboard/clients');
    return { success: true, message: 'Successfully added predefined plan.' };
  } catch (error) {
    console.error("Error adding predefined plan:", error);
    return { success: false, message: 'Failed to add predefined plan.' };
  }
}

/**
 * Deletes a predefined plan from the workspace
 */
export async function deletePredefinedPlanAction(planId: string) {
  await dbConnect();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const deleted = await PredefinedPlan.findOneAndDelete({
      _id: planId,
      userId: user.workspaceId
    });

    if (!deleted) {
      return { success: false, message: 'Plan not found.' };
    }

    revalidatePath('/dashboard/clients');
    return { success: true, message: 'Successfully deleted predefined plan.' };
  } catch (error) {
    console.error("Error deleting predefined plan:", error);
    return { success: false, message: 'Failed to delete predefined plan.' };
  }
}
