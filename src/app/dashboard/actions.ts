"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserTierAction() {
  try {
    const user = await requireAuth();
    const creator = await db.creator.findUnique({
      where: { id: user.id },
      select: { tier: true }
    });
    return { success: true, tier: creator?.tier || "FREE", userId: user.id };
  } catch (error) {
    return { success: false, tier: "FREE", userId: null };
  }
}

export async function activateFreePlanAction() {
  try {
    const user = await requireAuth();

    await db.creator.upsert({
      where: { id: user.id },
      update: {
        tier: "FREE",
        aiCredits: 50,
        has_completed_pricing: true,
        has_completed_onboarding: true,
      },
      create: {
        id: user.id,
        email: user.email!,
        tier: "FREE",
        aiCredits: 50,
        has_completed_onboarding: true,
        has_completed_pricing: true,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to execute free tier initialization:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function activatePremiumPlanAction() {
  try {
    const user = await requireAuth();

    await db.creator.upsert({
      where: { id: user.id },
      update: {
        tier: "PRO",
        aiCredits: 500,
        has_completed_pricing: true,
        has_completed_onboarding: true,
      },
      create: {
        id: user.id,
        email: user.email!,
        tier: "PRO",
        aiCredits: 500,
        has_completed_onboarding: true,
        has_completed_pricing: true,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to execute premium tier initialization:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function activateAgencyPlanAction() {
  try {
    const user = await requireAuth();

    await db.creator.upsert({
      where: { id: user.id },
      update: {
        tier: "AGENCY",
        aiCredits: 6000,
        has_completed_pricing: true,
        has_completed_onboarding: true,
      },
      create: {
        id: user.id,
        email: user.email!,
        tier: "AGENCY",
        aiCredits: 6000,
        has_completed_onboarding: true,
        has_completed_pricing: true,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to execute agency tier initialization:", error);
    return { success: false, error: "Internal Server Error" };
  }
}