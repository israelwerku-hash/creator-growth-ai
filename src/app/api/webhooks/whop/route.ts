import { NextResponse } from "next/server";
import { Whop } from "@whop/sdk";
import { db } from "@/lib/db";
import { TIER_CREDITS } from "@/lib/constants/pricing";
import { createAuditLog } from "@/lib/audit";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

// Initialize Whop SDK with webhookKey requiring btoa encoding
const whopsdk = new Whop({
  webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});

// ── Plan ID → Credit & Tier Mapping ──────────────────────────────────────────
const SUBSCRIPTION_PLAN_MAP: Record<string, { tier: string; credits: number }> = {
  // Pro Monthly
  [process.env.NEXT_PUBLIC_WHOP_PRO_MONTHLY_PLAN_ID || "plan_FoNiy1itUo9zU"]: {
    tier: "PRO",
    credits: TIER_CREDITS.PRO,
  },
  // Pro Annual
  [process.env.NEXT_PUBLIC_WHOP_PRO_ANNUAL_PLAN_ID || "plan_K8zNMMW1INY9u"]: {
    tier: "PRO",
    credits: TIER_CREDITS.PRO,
  },
  // Agency Monthly
  [process.env.NEXT_PUBLIC_WHOP_AGENCY_MONTHLY_PLAN_ID || "plan_CBRF1UZk35x39"]: {
    tier: "AGENCY",
    credits: TIER_CREDITS.AGENCY,
  },
  // Agency Annual
  [process.env.NEXT_PUBLIC_WHOP_AGENCY_ANNUAL_PLAN_ID || "plan_1HGEvyOehwXBc"]: {
    tier: "AGENCY",
    credits: TIER_CREDITS.AGENCY,
  },
};

const TOPUP_PLAN_MAP: Record<string, number> = {
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_STARTER_PLAN_ID || "plan_EcrupRkcyUBbY"]: 150,
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_GROWTH_PLAN_ID || "plan_3RZaGXuKIGBkG"]: 500,
  [process.env.NEXT_PUBLIC_WHOP_TOPUP_ELITE_PLAN_ID || "plan_YeAEmJVsE2pve"]: 1500,
};

// ── Webhook Signature Verification ───────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Read raw body text first (must happen before any .json() call)
    const rawBody = await req.text();
    
    // 2. Convert headers to a standard object as expected by the SDK
    const headers = Object.fromEntries(req.headers.entries());

    // 3. Separate diagnostic checks
    if (!process.env.WHOP_WEBHOOK_SECRET) {
      console.error("[Whop Webhook] Error: WHOP_WEBHOOK_SECRET environment variable is missing on Netlify.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 4. Unwrap and verify using the SDK
    let payload;
    try {
      payload = await whopsdk.webhooks.unwrap(rawBody, { headers });
    } catch (err: any) {
      console.warn("[Whop Webhook] Error: Signature verification failed.", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 5. Signature valid — extract event details
    const eventType = payload.event || payload.action;
    const data = payload.data || payload;

    console.log(`[Whop Webhook] Received event: ${eventType}`);

    console.log("Whop Webhook Received:", JSON.stringify(data));

    // ── 2. Extract user identifier ──
    let userId =
      data.metadata?.userId ||
      data.custom_metadata?.userId ||
      data.discord_account_id ||
      null;

    const targetEmail = payload.data?.user?.email || payload.data?.email || payload.user?.email || null;

    if (!userId && targetEmail) {
      const existingCreator = await db.creator.findFirst({
        where: { email: { equals: targetEmail, mode: "insensitive" } },
      });
      if (existingCreator) {
        userId = existingCreator.id;
      }
    }

    const planId = data.plan_id || data.plan?.id || null;

    // ── 3. Handle Subscription Payment Success ──
    if (
      eventType === "membership.went_valid" ||
      eventType === "payment.succeeded" ||
      eventType === "payment_succeeded" ||
      eventType === "action: payment.succeeded" ||
      eventType === "membership.renewed"
    ) {
      if (!userId) {
        console.warn("[Whop Webhook] Payment event received but no userId or email matched in database.", { planId, targetEmail });
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      // Determine credits to add
      let creditsToAdd = 0;
      let isSubscription = false;
      let tierToSet = "PRO"; // default fallback

      if (planId && SUBSCRIPTION_PLAN_MAP[planId]) {
        creditsToAdd = SUBSCRIPTION_PLAN_MAP[planId].credits;
        tierToSet = SUBSCRIPTION_PLAN_MAP[planId].tier;
        isSubscription = true;
      } else if (planId && TOPUP_PLAN_MAP[planId]) {
        creditsToAdd = TOPUP_PLAN_MAP[planId];
      } else {
        // Parse amount if present, or fallback to 500
        const amount = data.amount ? parseFloat(data.amount) : 0;
        if (amount > 0 && amount <= 10) creditsToAdd = 150;
        else if (amount > 10 && amount <= 30) creditsToAdd = 500;
        else if (amount > 30) creditsToAdd = 1500;
        else creditsToAdd = 500;
        
        console.warn(`[Whop Webhook] Unknown plan ID: ${planId}. Using safety fallback of ${creditsToAdd} credits based on amount.`);
      }

      const whopMembershipId = data.id || data.membership_id || null;
      let updatedUser;

      if (isSubscription) {
        console.log(`[Whop Webhook] Subscription: ${tierToSet} | Incrementing Credits: ${creditsToAdd} | User: ${userId}`);
        
        updatedUser = await db.creator.update({
          where: { id: userId },
          data: {
            tier: tierToSet,
            aiCredits: { increment: creditsToAdd },
            has_completed_pricing: true,
            has_completed_onboarding: true,
            ...(whopMembershipId && { paddleSubscriptionId: whopMembershipId }),
          },
        });
      } else {
        console.log(`[Whop Webhook] Top-Up: +${creditsToAdd} credits | User: ${userId}`);
        
        updatedUser = await db.creator.update({
          where: { id: userId },
          data: {
            aiCredits: { increment: creditsToAdd },
          },
        });
      }

      console.log(`[Whop Webhook] Updated User Record:`, updatedUser);

      try {
        await createAuditLog("SYSTEM_WEBHOOK", isSubscription ? "SUBSCRIPTION_UPGRADE" : "CREDIT_TOPUP", {
          creatorId: userId,
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

    // ── 4. Handle Cancellation ──
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
        const membershipId = data.id || data.membership_id;
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
            }
          } catch (lookupErr) {
            console.error("[Whop Webhook] Membership ID lookup fallback failed:", lookupErr);
          }
        }
      }

      return NextResponse.json({ received: true, action: "subscription_canceled" }, { status: 200 });
    }

    // ── 5. Acknowledge unhandled events ──
    console.log(`[Whop Webhook] Unhandled event type: ${eventType}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[Whop Webhook] Fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
