import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";
import { createAuditLog } from "@/lib/audit";

// Prevent Vercel from aggressively caching this cron route
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow 5 minutes for processing

export async function GET(request: Request) {
  try {
    // 1. Strict CRON_SECRET Guard
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron Webhook] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Atomic Fetch & Lock using CTE (FOR UPDATE SKIP LOCKED)
    // This entirely eliminates race conditions by grabbing rows and marking them PROCESSING in a single, indivisible step.
    const pendingEvents = await db.$queryRaw<any[]>`
      WITH cte AS (
        SELECT id FROM "WebhookEvent"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT 20
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "WebhookEvent" e
      SET status = 'PROCESSING', "updatedAt" = NOW()
      FROM cte
      WHERE e.id = cte.id
      RETURNING e.*;
    `;

    if (!pendingEvents || pendingEvents.length === 0) {
      return NextResponse.json({ success: true, message: "No pending events." }, { status: 200 });
    }

    // 3. Process the Queue
    for (const event of pendingEvents) {
      try {
        const payload = event.payload as any;

        // If it's a Whop event, the original data is inside payload.data
        const eventData = payload.data;
        const eventType = payload.eventType || payload.event || payload.action;
        const creatorId = eventData?.customData?.creatorId as string | undefined;

        if (!creatorId) {
          throw new Error("No creatorId attached to customData. Cannot sync to user.");
        }

        switch (eventType) {
          case "membership.went_valid":
          case "payment.succeeded":
          case "transaction.completed": {
            const planId = eventData?.plan_id || eventData?.plan?.id || eventData?.items?.[0]?.price?.id;
            
            let newTier = "FREE";
            const proPlanIds = [process.env.NEXT_PUBLIC_WHOP_PRO_MONTHLY_PLAN_ID, process.env.NEXT_PUBLIC_WHOP_PRO_ANNUAL_PLAN_ID];
            const agencyPlanIds = [process.env.NEXT_PUBLIC_WHOP_AGENCY_MONTHLY_PLAN_ID, process.env.NEXT_PUBLIC_WHOP_AGENCY_ANNUAL_PLAN_ID];
            if (proPlanIds.includes(planId)) {
              newTier = "PRO";
            } else if (agencyPlanIds.includes(planId)) {
              newTier = "AGENCY";
            }

            // Upgrade Creator Tier
            await db.creator.update({
              where: { id: creatorId },
              data: { tier: newTier },
            });

            // Log Revenue for Analytics
            const amountStr = eventData?.details?.totals?.total || "0";
            const amount = parseInt(amountStr, 10);

            if (amount > 0) {
              await db.revenueEvent.create({
                data: {
                  creatorId,
                  amount,
                  source: `Whop Subscription (${newTier})`,
                },
              });
            }

            // Automated System Audit Log
            await createAuditLog("SYSTEM_WEBHOOK", "SUBSCRIPTION_UPGRADE", {
              creatorId,
              tierAssigned: newTier,
              revenueAmount: amount,
              whopEventId: event.id
            });
            break;
          }

          case "membership.went_invalid":
          case "membership.cancelled":
          case "subscription.canceled": {
            await db.creator.update({
              where: { id: creatorId },
              data: { tier: "FREE" },
            });

            // Automated System Audit Log
            await createAuditLog("SYSTEM_WEBHOOK", "SUBSCRIPTION_CANCELED", {
              creatorId,
              tierAssigned: "FREE",
              whopEventId: event.id
            });
            break;
          }

          default:
            // Safely ignore events we don't care about
            break;
        }

        // Mark as successfully processed
        await db.webhookEvent.update({
          where: { id: event.id },
          data: { status: "PROCESSED" },
        });

      } catch (eventError: any) {
        // Mark as failed and store the error message
        Sentry.captureException(eventError);
        console.error(`[Cron Webhook] Failed to process event ${event.id}:`, eventError.message);
        
        await db.webhookEvent.update({
          where: { id: event.id },
          data: { 
            status: "FAILED",
            errorMessage: eventError.message || "Unknown error occurred"
          },
        });
      }
    }

    return NextResponse.json({ success: true, processedCount: pendingEvents.length }, { status: 200 });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[Cron Webhook Fatal Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
