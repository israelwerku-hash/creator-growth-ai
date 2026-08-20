import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { TIER_CREDITS } from "@/lib/constants/pricing";
import { createAuditLog } from "@/lib/audit";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

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

// ── HMAC Signature Verification ──────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Read raw body text first (must happen before any .json() call)
    const rawBody = await req.text();

    // 2. Get the Whop signature header (check all possible variations)
    const signature =
      req.headers.get("webhook-signature") ||
      req.headers.get("x-whop-signature") ||
      req.headers.get("whop-signature");

    // 3. Separate diagnostic checks
    const secret = process.env.WHOP_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Whop Webhook] Error: WHOP_WEBHOOK_SECRET environment variable is missing on Netlify.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (!signature) {
      console.error("[Whop Webhook] Error: Signature header missing. Received headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
      return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // 4. Compare signatures
    if (signature !== expectedSignature) {
      console.warn("[Whop Webhook] Signature mismatch.", {
        received: signature.substring(0, 12) + "...",
        expected: expectedSignature.substring(0, 12) + "...",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 5. Signature valid — parse the payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.event || payload.action;
    const data = payload.data || payload;

    console.log(`[Whop Webhook] Received event: ${eventType}`);

    // ── 2. Extract user identifier ──
    const userId =
      data.metadata?.userId ||
      data.custom_metadata?.userId ||
      data.discord_account_id ||
      null;

    const planId = data.plan_id || data.plan?.id || null;

    // ── 3. Handle Subscription Payment Success ──
    if (
      eventType === "membership.went_valid" ||
      eventType === "payment.succeeded" ||
      eventType === "membership.renewed"
    ) {
      // Check subscription plans first
      const subMapping = planId ? SUBSCRIPTION_PLAN_MAP[planId] : null;

      if (subMapping && userId) {
        console.log(
          `[Whop Webhook] Subscription: ${subMapping.tier} | Credits: ${subMapping.credits} | User: ${userId}`
        );

        const whopMembershipId = data.id || data.membership_id || null;

        await db.creator.upsert({
          where: { id: userId },
          update: {
            tier: subMapping.tier,
            aiCredits: subMapping.credits,
            has_completed_pricing: true,
            has_completed_onboarding: true,
            ...(whopMembershipId && { paddleSubscriptionId: whopMembershipId }),
          },
          create: {
            id: userId,
            email: data.email || `${userId}@whop-user.com`,
            name: data.user?.username || "Whop User",
            tier: subMapping.tier,
            aiCredits: subMapping.credits,
            has_completed_onboarding: true,
            has_completed_pricing: true,
            paddleSubscriptionId: whopMembershipId,
          },
        });

        try {
          await createAuditLog("SYSTEM_WEBHOOK", "SUBSCRIPTION_UPGRADE", {
            creatorId: userId,
            tierAssigned: subMapping.tier,
            creditsSet: subMapping.credits,
            whopPlanId: planId,
            whopMembershipId,
          });
        } catch (auditErr) {
          console.warn("[Whop Webhook] Audit log failed (non-fatal):", auditErr);
        }

        return NextResponse.json({ received: true, action: "subscription_provisioned" }, { status: 200 });
      }

      // Check top-up plans
      const topupCredits = planId ? TOPUP_PLAN_MAP[planId] : null;

      if (topupCredits && userId) {
        console.log(
          `[Whop Webhook] Top-Up: +${topupCredits} credits | User: ${userId}`
        );

        await db.creator.update({
          where: { id: userId },
          data: {
            aiCredits: { increment: topupCredits },
          },
        });

        try {
          await createAuditLog("SYSTEM_WEBHOOK", "CREDIT_TOPUP", {
            creatorId: userId,
            creditsAdded: topupCredits,
            whopPlanId: planId,
          });
        } catch (auditErr) {
          console.warn("[Whop Webhook] Audit log failed (non-fatal):", auditErr);
        }

        return NextResponse.json({ received: true, action: "topup_provisioned" }, { status: 200 });
      }

      if (!userId) {
        console.warn("[Whop Webhook] Payment event received but no userId found in metadata.", { planId });
      }
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
