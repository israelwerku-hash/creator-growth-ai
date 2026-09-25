import { NextResponse } from "next/server";
import { Whop } from "@whop/sdk";
import { db } from "@/lib/db";
import { TIER_CREDITS } from "@/lib/constants/pricing";
import { createAuditLog } from "@/lib/audit";
import * as Sentry from "@sentry/nextjs";
import crypto from "crypto";

export const runtime = "nodejs";

// ── SDK Instances ────────────────────────────────────────────────────────────
// Webhook verification client (only needs webhookKey)
const whopWebhook = new Whop({
  webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});

// API client for membership lookups (needs apiKey)
const whopApi = new Whop({
  apiKey: process.env.WHOP_API_KEY || "",
});

// ── Plan ID → Credit & Tier Mapping ──────────────────────────────────────────
const SUBSCRIPTION_PLAN_MAP: Record<string, { tier: string; credits: number }> = {
  [process.env.NEXT_PUBLIC_WHOP_PRO_MONTHLY_PLAN_ID || ""]: {
    tier: "PRO",
    credits: TIER_CREDITS.PRO,
  },
  [process.env.NEXT_PUBLIC_WHOP_PRO_ANNUAL_PLAN_ID || ""]: {
    tier: "PRO",
    credits: TIER_CREDITS.PRO,
  },
  [process.env.NEXT_PUBLIC_WHOP_AGENCY_MONTHLY_PLAN_ID || ""]: {
    tier: "AGENCY",
    credits: TIER_CREDITS.AGENCY,
  },
  [process.env.NEXT_PUBLIC_WHOP_AGENCY_ANNUAL_PLAN_ID || ""]: {
    tier: "AGENCY",
    credits: TIER_CREDITS.AGENCY,
  },
};

const TOPUP_PLAN_MAP: Record<string, number> = {
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_STARTER_PLAN_ID || ""]: 150,
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_GROWTH_PLAN_ID || ""]: 500,
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_ELITE_PLAN_ID || ""]: 1500,
};

// ── Helper: Resolve user from all available identifiers ──────────────────────
async function resolveUserId(data: any, payload: any, bodyJson: any): Promise<{ userId: string | null; resolvedEmail: string | null }> {
  // 1. Try direct userId from metadata / custom fields
  let userId =
    data.metadata?.userId ||
    data.custom_metadata?.userId ||
    data.custom_fields?.userId ||
    data.discord_account_id ||
    null;

  // 2. Extract email from every possible Whop payload location
  let targetEmail =
    data.metadata?.email ||
    data.custom_metadata?.email ||
    data.custom_fields?.email ||
    (payload as any).data?.user?.email ||
    (payload as any).data?.email ||
    (payload as any).user?.email ||
    data.user?.email ||
    data.email ||
    bodyJson.data?.user?.email ||
    bodyJson.data?.email ||
    null;

  console.log(`[Whop Webhook] Initial identifiers — userId: ${userId}, email: ${targetEmail}`);

  // 3. Validate userId against DB — if missing, force email fallback
  if (userId) {
    const existingById = await db.creator.findUnique({ where: { id: userId } });
    if (!existingById) {
      console.warn(`[Whop Webhook] userId "${userId}" from metadata not found in DB. Falling back.`);
      userId = null;
    }
  }

  // 4. Try email-based lookup
  if (!userId && targetEmail) {
    const existingCreator = await db.creator.findFirst({
      where: { email: { equals: targetEmail, mode: "insensitive" } },
    });
    if (existingCreator) {
      userId = existingCreator.id;
      console.log(`[Whop Webhook] Matched user by email: ${targetEmail} → ${userId}`);
    }
  }

  // 5. Whop SDK membership lookup fallback
  if (!userId) {
    const membershipId = data.membership?.id || data.membership_id || data.id;
    if (membershipId && typeof membershipId === "string" && membershipId.startsWith("mem_")) {
      console.log(`[Whop Webhook] Attempting SDK membership lookup for: ${membershipId}`);
      try {
        const membership = await whopApi.memberships.retrieve(membershipId);
        console.log(`[Whop Webhook] SDK membership response — user email: ${membership.user?.email}, plan: ${membership.plan?.id}`);

        if (membership.user?.email) {
          targetEmail = membership.user.email;
          const creatorByEmail = await db.creator.findFirst({
            where: { email: { equals: targetEmail, mode: "insensitive" } },
          });
          if (creatorByEmail) {
            userId = creatorByEmail.id;
            console.log(`[Whop Webhook] Matched user via SDK membership email: ${targetEmail} → ${userId}`);
          }
        }

        // Also check membership metadata for userId
        if (!userId && membership.metadata) {
          const metaUserId = (membership.metadata as any).userId;
          if (metaUserId) {
            const creatorById = await db.creator.findUnique({ where: { id: metaUserId } });
            if (creatorById) {
              userId = metaUserId;
              console.log(`[Whop Webhook] Matched user via SDK membership metadata: ${userId}`);
            }
          }
        }
      } catch (sdkErr: any) {
        console.warn(`[Whop Webhook] SDK membership.retrieve failed for ${membershipId}:`, sdkErr.message);
      }
    }
  }

  return { userId, resolvedEmail: targetEmail };
}

// ── Webhook Handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Read raw body text first (must happen before any .json() call)
    const rawBody = await req.text();
    
    // 2. Convert headers to a standard object as expected by the SDK
    const headers = Object.fromEntries(req.headers.entries());

    // 3. Separate diagnostic checks
    if (!process.env.WHOP_WEBHOOK_SECRET) {
      console.error("[Whop Webhook] Error: WHOP_WEBHOOK_SECRET environment variable is missing.");
      return NextResponse.json({ received: true, warning: "Server configuration error" }, { status: 200 });
    }

    // 4. Unwrap and verify using the SDK
    let payload;
    try {
      payload = await whopWebhook.webhooks.unwrap(rawBody, { headers });
    } catch (err: any) {
      console.warn("[Whop Webhook] Error: Signature verification failed.", err.message);
      // Still return 200 to avoid Whop marking webhook as failing
      return NextResponse.json({ received: true, warning: "Invalid signature" }, { status: 200 });
    }

    // 5. Signature valid — extract event details
    const bodyJson = JSON.parse(rawBody);

    console.log("Full unwrapped event keys:", Object.keys(payload));
    console.log("Full unwrapped payload:", JSON.stringify(payload));

    // Robust event type extraction
    const eventType =
      (payload as any).type ||
      (payload as any).event ||
      (payload as any).action ||
      bodyJson.type ||
      bodyJson.event ||
      bodyJson.action ||
      null;

    const data = (payload as any).data || payload;

    console.log(`[Whop Webhook] Resolved event type: ${eventType}`);
    console.log("[Whop Webhook] Event data:", JSON.stringify(data));
    
    // Log plan and product identifiers for debugging checkout links
    console.log(`[Whop Webhook] Plan/Product Debug — Plan ID: ${data.plan?.id || data.plan_id}, Product Title: ${data.product?.title}, Product Route: ${data.product?.route}`);

    // ── Resolve User ──
    const { userId, resolvedEmail } = await resolveUserId(data, payload, bodyJson);

    // Extract plan ID from multiple possible locations
    const planId =
      data.plan_id ||
      data.plan?.id ||
      data.membership?.plan?.id ||
      null;

    // ── Handle Payment / Subscription Success ──
    const isPaymentEvent =
      eventType === "membership.went_valid" ||
      eventType === "payment.succeeded" ||
      eventType === "payment_succeeded" ||
      eventType === "membership.renewed" ||
      (eventType && typeof eventType === "string" && (eventType.includes("payment.succeeded") || eventType.includes("payment_succeeded"))) ||
      data.status === "paid";

    if (isPaymentEvent) {
      // ── Dynamic Product Routing ──
      let creditsToAdd = 0;
      let isSubscription = false;
      let tierToSet = "PRO";

      // 1. Prioritize Product Title Matching First
      const productTitle = (data.product?.title || "").toLowerCase();
      const productRoute = (data.product?.route || "").toLowerCase();
      const matchStr = `${productTitle}${productRoute}`;
      let matchedByString = false;

      // Strict Keyword Evaluation Order
      if (matchStr.includes("elite")) {
        creditsToAdd = 1500;
        matchedByString = true;
      } else if (matchStr.includes("starter")) {
        creditsToAdd = 150;
        matchedByString = true;
      } else if (matchStr.includes("growth")) {
        creditsToAdd = 500;
        matchedByString = true;
      }

      if (matchedByString) {
        console.log(`[Whop Webhook] MATCHED TIER: (${matchStr} -> Provisioning) ${creditsToAdd} credits`);
      } else if (planId && SUBSCRIPTION_PLAN_MAP[planId]) {
        creditsToAdd = SUBSCRIPTION_PLAN_MAP[planId].credits;
        tierToSet = SUBSCRIPTION_PLAN_MAP[planId].tier;
        isSubscription = true;
        console.log(`[Whop Webhook] MATCHED TIER: (${tierToSet} -> Provisioning) ${creditsToAdd} credits`);
      } else if (planId && TOPUP_PLAN_MAP[planId]) {
        creditsToAdd = TOPUP_PLAN_MAP[planId];
        console.log(`[Whop Webhook] MATCHED TIER: (TOP-UP PLAN ID -> Provisioning) ${creditsToAdd} credits`);
      } else {
        console.error(`[Whop Webhook] CRITICAL: Unknown credit package. Payload product: ${JSON.stringify(data.product)}, Plan ID: ${planId}`);
        // Do not default to 500 credits. Return early so we don't accidentally update the user's credits improperly.
        return NextResponse.json({ success: true, warning: "Unknown credit package logged" }, { status: 200 });
      }

      const whopMembershipId = data.membership?.id || data.membership_id || data.id || null;
      let updatedUser;
      
      const safeEmail = resolvedEmail ? resolvedEmail.trim().toLowerCase() : null;

      if (!userId && !safeEmail) {
        console.error("[Whop Webhook] PAYMENT EVENT — NO USER IDENTIFIER (USERID/EMAIL) FOUND.");
        console.error("[Whop Webhook] Full event.data:", JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, warning: "Missing identifier, logged for review" }, { status: 200 });
      }

      // We need a fallback ID for new creators (Supabase normally generates this, but we are bypassing it)
      const newUserId = crypto.randomUUID();

      // If we don't have a userId, we'll try to find by email or auto-create using email.
      // Note: We use upsert if we know the email. If we only have userId, we update.
      if (safeEmail) {
        const userName = data.user?.name || data.metadata?.name || data.custom_metadata?.name || data.custom_fields?.name || "New User";
        
        console.log(`[Whop Webhook] UPSERTING user for email: ${safeEmail}`);

        if (isSubscription) {
          updatedUser = await db.creator.upsert({
            where: { email: safeEmail },
            update: {
              tier: tierToSet,
              aiCredits: { increment: creditsToAdd },
              has_completed_pricing: true,
              has_completed_onboarding: true,
              ...(whopMembershipId && { paddleSubscriptionId: whopMembershipId }),
            },
            create: {
              id: newUserId,
              email: safeEmail,
              name: userName,
              tier: tierToSet,
              aiCredits: creditsToAdd, // For new users, increment base is 0
              has_completed_pricing: true,
              has_completed_onboarding: true,
              ...(whopMembershipId && { paddleSubscriptionId: whopMembershipId }),
            }
          });
        } else {
          updatedUser = await db.creator.upsert({
            where: { email: safeEmail },
            update: {
              aiCredits: { increment: creditsToAdd },
            },
            create: {
              id: newUserId,
              email: safeEmail,
              name: userName,
              tier: "FREE",
              aiCredits: creditsToAdd, 
              has_completed_pricing: true,
              has_completed_onboarding: true,
            }
          });
        }
      } else {
        // We only have a userId (no email), so we can only update the existing record
        if (isSubscription) {
          updatedUser = await db.creator.update({
            where: { id: userId! },
            data: {
              tier: tierToSet,
              aiCredits: { increment: creditsToAdd },
              has_completed_pricing: true,
              has_completed_onboarding: true,
              ...(whopMembershipId && { paddleSubscriptionId: whopMembershipId }),
            },
          });
        } else {
          updatedUser = await db.creator.update({
            where: { id: userId! },
            data: {
              aiCredits: { increment: creditsToAdd },
            },
          });
        }
      }

      // Update the userId for logging below
      const finalUserId = userId || updatedUser?.id || newUserId;

      console.log(`[Whop Webhook] Updated/Created User Record:`, JSON.stringify(updatedUser));
      console.log(`[Whop Webhook] FINAL CREDIT BALANCE for ${finalUserId}: ${updatedUser?.aiCredits} credits (Added: ${creditsToAdd})`);

      try {
        await createAuditLog("SYSTEM_WEBHOOK", isSubscription ? "SUBSCRIPTION_UPGRADE" : "CREDIT_TOPUP", {
          creatorId: finalUserId,
          creditsAdded: creditsToAdd,
          ...(isSubscription && { tierAssigned: tierToSet }),
          whopPlanId: planId,
          whopMembershipId,
        });
      } catch (auditErr) {
        console.warn("[Whop Webhook] Audit log failed (non-fatal):", auditErr);
      }

      return NextResponse.json({ received: true, action: isSubscription ? "subscription_provisioned" : "topup_provisioned" }, { status: 200 });
    }

    // ── Handle Cancellation ──
    if (
      eventType === "membership.went_invalid" ||
      eventType === "membership.cancelled"
    ) {
      if (userId) {
        await db.creator.update({
          where: { id: userId },
          data: {
            tier: "FREE",
            paddleSubscriptionId: null,
          },
        });

        try {
          await createAuditLog("SYSTEM_WEBHOOK", "SUBSCRIPTION_CANCELED", {
            creatorId: userId,
            tierAssigned: "FREE",
            whopPlanId: planId,
          });
        } catch (auditErr) {
          console.warn("[Whop Webhook] Audit log failed (non-fatal):", auditErr);
        }

        console.log(`[Whop Webhook] User ${userId} downgraded to FREE.`);
      } else {
        // Fallback: find by membership ID stored in paddleSubscriptionId field
        const membershipId = data.membership?.id || data.membership_id || data.id;
        if (membershipId) {
          try {
            const creator = await db.creator.findFirst({
              where: { paddleSubscriptionId: membershipId },
              select: { id: true },
            });
            if (creator) {
              await db.creator.update({
                where: { id: creator.id },
                data: { tier: "FREE", paddleSubscriptionId: null },
              });
              console.log(`[Whop Webhook] Creator ${creator.id} downgraded via membership ID lookup.`);
            } else {
              console.warn(`[Whop Webhook] Cancellation: No creator found for membership ${membershipId}`);
            }
          } catch (lookupErr) {
            console.error("[Whop Webhook] Membership ID lookup fallback failed:", lookupErr);
          }
        }
      }

      return NextResponse.json({ received: true, action: "subscription_canceled" }, { status: 200 });
    }

    // ── Acknowledge unhandled events ──
    console.log(`[Whop Webhook] Unhandled event type: ${eventType}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[Whop Webhook] Fatal error:", error);
    // Even on fatal errors, return 200 to prevent Whop from disabling webhook
    return NextResponse.json({ received: true, warning: "Internal error logged" }, { status: 200 });
  }
}
