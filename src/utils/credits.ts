import { requireAuth } from "@/utils/supabase/server";
import { db } from "@/lib/db";

export const CREDIT_MATRIX = {
  "AI_DM_GENERATION": { cost: 30, label: "AI DM Generation (Premium Copy Engine)" },
  "AI_SEGMENTATION": { cost: 25, label: "AI Segmentation Feature" },
  "DATA_METRIC_LOGGER": { cost: 5, label: "Data Metric Logger" },
  "MEMORY_VAULT": { cost: 20, label: "Memory Vault" },
  "LANGUAGE_TRANSLATOR": { cost: 15, label: "Language Translator Hub" },
} as const;

export type CreditOperation = keyof typeof CREDIT_MATRIX;

/**
 * A bulletproof Credit Gatekeeper validation utility for Next.js Server Actions.
 * Validates the session using Supabase SSR, checks the Prisma 'creator' table for
 * sufficient allocation, and atomically decrements the correct amount.
 */
export async function consumeCredits(operation: CreditOperation) {
  try {
    // 1. Authenticate user via our new Supabase SSR utility
    const user = await requireAuth();
    if (!user || !user.id) {
      return { success: false, error: "Unauthorized session" };
    }

    const { cost } = CREDIT_MATRIX[operation];

    // 2. Fetch current balance to check if they have enough (fast read)
    const creator = await db.creator.findUnique({
      where: { id: user.id },
      select: { aiCredits: true },
    });

    if (!creator) {
      return { success: false, error: "Creator profile not found" };
    }

    if (creator.aiCredits <= 0 || creator.aiCredits < cost) {
      return { success: false, error: "Insufficient credits", requiresUpgrade: true };
    }

    // 3. Atomically decrement credits
    const updatedCreator = await db.creator.update({
      where: { 
        id: user.id,
        aiCredits: { gte: cost } 
      },
      data: { 
        aiCredits: { decrement: cost } 
      },
    });

    return { 
      success: true, 
      remainingCredits: updatedCreator.aiCredits 
    };

  } catch (error: any) {
    console.error(`[Credit Gatekeeper] Failed to consume credits for ${operation}:`, error);
    
    // Prisma throws a "RecordNotFound" error if the update `where` condition fails
    // (i.e., someone spent credits via race condition before we updated)
    if (error?.code === "P2025") {
      return { success: false, error: "Insufficient credits", requiresUpgrade: true };
    }

    return { success: false, error: "Failed to process credit transaction" };
  }
}
