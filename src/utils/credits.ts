import { db } from "@/lib/db";
import { CREDIT_COSTS, CreditOperation } from "@/lib/constants/credits";

/**
 * A bulletproof Credit Gatekeeper validation utility for Next.js Server Actions and API Routes.
 * Validates the session using the provided userId, checks the Prisma 'creator' table for
 * sufficient allocation, and atomically decrements the correct amount.
 */
export async function consumeCredits(userId: string, operation: CreditOperation) {
  try {
    if (!userId) {
      return { success: false, error: "Unauthorized session" };
    }

    const cost = CREDIT_COSTS[operation];

    // 1. Fetch current balance to check if they have enough (fast read)
    const creator = await db.creator.findUnique({
      where: { id: userId },
      select: { aiCredits: true },
    });

    if (!creator) {
      return { success: false, error: "Creator profile not found" };
    }

    if (creator.aiCredits <= 0 || creator.aiCredits < cost) {
      return { success: false, error: `Insufficient credits. Required: ${cost} credits.`, requiresUpgrade: true };
    }

    // 2. Atomically decrement credits
    const updatedCreator = await db.creator.update({
      where: { 
        id: userId,
        aiCredits: { gte: cost } 
      },
      data: { 
        aiCredits: { decrement: cost } 
      },
    });

    // 3. Log the usage to the AuditLog table
    await db.auditLog.create({
      data: {
        actor: userId,
        action: `CREDIT_CONSUMPTION_${operation}`,
        metadata: {
          cost: cost,
          operation: operation,
          remaining: updatedCreator.aiCredits
        }
      }
    });

    console.log(`[CREDITS] Deducted ${cost} credits for ${operation}. Remaining: ${updatedCreator.aiCredits}`);

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
