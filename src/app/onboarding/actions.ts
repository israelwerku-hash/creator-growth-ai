"use server";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/utils/supabase/server";
import { TIER_CREDITS } from "@/lib/constants/pricing";

export async function autoHealCreatorAction() {
  try {
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id;
    if (!userId) return { success: false };

    // Auto-heal: If row doesn't exist, create it. If it does, do nothing.
    await prisma.creator.upsert({
      where: { id: userId },
      update: {}, // do nothing if exists
      create: {
        id: userId,
        email: session?.user?.email || "",
        name: session?.user?.user_metadata?.name || "Creator",
        tier: "FREE",
        aiCredits: TIER_CREDITS.FREE,
        has_completed_onboarding: false,
        has_completed_pricing: false,
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to auto-heal creator:", error);
    return { success: false };
  }
}

export async function completeOnboardingAction(answers: Record<string, string>) {
  try {
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id;
    
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Bulletproof fallback: use upsert to guarantee it saves
    await prisma.creator.upsert({
      where: { id: userId },
      update: { has_completed_onboarding: true },
      create: {
        id: userId,
        email: session?.user?.email || "",
        name: session?.user?.user_metadata?.name || "Creator",
        tier: "FREE",
        aiCredits: TIER_CREDITS.FREE,
        has_completed_onboarding: true,
        has_completed_pricing: false,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}
