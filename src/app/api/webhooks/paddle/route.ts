import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
// 🚀 Import your Prisma client instance
import { db } from "@/lib/db"; 

// Force Node.js runtime (required for Paddle SDK crypto operations)
export const runtime = "nodejs";

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY || "dummy", {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
});

export async function POST(req: Request) {
  try {
    // 1. Read raw body text BEFORE any parsing — critical for HMAC verification!
    //    Using plain `Request` type (NOT NextRequest) to avoid any body pre-processing.
    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature");
    // Explicitly use the provided secret as a fallback to rule out .env loading issues
    const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "pdl_ntfset_01kxtpkszze9dymfa1yz12mynb_OXgxf0og/dZpjQVLGh6G9fNs/XshsyjB";

    console.log(
      "[Webhook Debug] Signature header:",
      signature ? `${signature.substring(0, 15)}...` : "MISSING",
      "Secret defined:",
      !!secret,
      "Raw body length:",
      rawBody.length
    );

    if (!secret) {
      console.error("❌ [Webhook Error] process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET is missing!");
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
    }

    if (!signature) {
      console.error("❌ [Webhook Error] paddle-signature header is missing from request!");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // 🛡️ DEEP DEBUGGING FOR HMAC FAILURE
    const parts = signature.split(";").reduce((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const ts = parts["ts"];
    const h1 = parts["h1"];
    
    // Test 1: Literal raw body
    const crypto = require("crypto");
    const payload1 = `${ts}:${rawBody}`;
    const hash1 = crypto.createHmac("sha256", secret).update(payload1).digest("hex");
    
    // Test 2: Normalized newlines (\r\n -> \n)
    const normalizedBody = rawBody.replace(/\r\n/g, '\n');
    const payload2 = `${ts}:${normalizedBody}`;
    const hash2 = crypto.createHmac("sha256", secret).update(payload2).digest("hex");

    console.log(`[HMAC Debug] Expected H1: ${h1}`);
    console.log(`[HMAC Debug] Computed Hash 1 (Raw): ${hash1} | Match: ${h1 === hash1}`);
    console.log(`[HMAC Debug] Computed Hash 2 (Normalized): ${hash2} | Match: ${h1 === hash2}`);

    let eventData: any;
    try {
      if (h1 === hash1 || h1 === hash2) {
         console.log("✅ Manual HMAC verification passed! Bypassing SDK unmarshal for parsing.");
         const bodyToParse = h1 === hash2 ? normalizedBody : rawBody;
         eventData = JSON.parse(bodyToParse);
         eventData.eventType = eventData.event_type || eventData.data?.event_type;
      } else {
         // Fallback to SDK to throw the error or succeed
         eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);
      }
    } catch (error: any) {
      console.error("❌ [Webhook Error] Signature verification failed.");
      
      // ⚠️ DEVELOPMENT BYPASS ⚠️
      // When using local proxies (ngrok, localtunnel, etc), they often invisibly reformat 
      // the JSON body spacing/newlines, which permanently breaks cryptographic signatures.
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ [DEV MODE] Bypassing strict signature check so local development can continue.");
        console.warn("⚠️ Make sure your production environment receives direct, un-proxied webhook payloads.");
        
        eventData = JSON.parse(rawBody);
        eventData.eventType = eventData.event_type || eventData.data?.event_type;
      } else {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // Extract event type from SDK-parsed data
    const eventType = eventData.eventType;

    // Also parse the raw body for customData extraction (SDK typing may not expose it directly)
    const payload = JSON.parse(rawBody);

    console.log(`✉️ Received legitimate Paddle Webhook Event: ${eventType}`);

    if (eventType === "transaction.completed" || eventType === "transaction.paid" || eventType === "subscription.created") {
      const customData = payload.custom_data || payload.data?.custom_data;
      const userId = customData?.userId;
      const tier = customData?.planSelected;
      
      // 🔒 SECURE BACKEND CREDIT MAPPING
      // Do not trust frontend customData for credit amounts. We map the exact Price ID from the webhook.
      const priceId = payload.data?.items?.[0]?.price?.id 
        || payload.data?.details?.line_items?.[0]?.price?.id 
        || payload.data?.items?.[0]?.price_id
        || null;
        
      const paddleSubscriptionId = payload.data?.subscription_id || null;
      
      const STARTER_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID || "";
      const GROWTH_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID || "";
      const ELITE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_ELITE_PRICE_ID || "";
      const PRO_MONTHLY_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID || "";
      const PRO_YEARLY_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID || "";
      const AGENCY_MONTHLY_ID = process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY_ID || "";
      const AGENCY_YEARLY_ID = process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY_ID || "";

      const PRICE_TO_CREDITS: Record<string, number> = {
        [STARTER_PRICE_ID]: 150,
        [GROWTH_PRICE_ID]: 500,
        [ELITE_PRICE_ID]: 1500,
      };

      // Calculate creditAmount based STRICTLY on the actual price ID paid for
      const creditAmount = priceId && PRICE_TO_CREDITS[priceId] ? PRICE_TO_CREDITS[priceId] : null;

      console.log(`[Webhook Debug] customData received:`, customData);
      console.log(`[Webhook Debug] Extracted userId:`, userId);
      console.log(`[Paddle Webhook] Incoming Price ID: ${priceId} | Sub ID: ${paddleSubscriptionId}`);
      console.log(`[Credit Allocation] Price ID: ${priceId || 'UNKNOWN'} -> Awarding ${creditAmount || 0} credits`);

      if (userId) {
        try {
          // --- CREDIT TOP-UP BUNDLE ---
          if (creditAmount && creditAmount > 0) {
            console.log(`✅ Credit Top-Up confirmed for user: ${userId}. Adding ${creditAmount} credits.`);
            
            await db.creator.update({
              where: { id: userId },
              data: {
                aiCredits: { increment: creditAmount },
              },
            });
            console.log(`💾 Successfully incremented credits for creator: ${userId}!`);
          } 
          // --- SUBSCRIPTION TIER UPGRADE ---
          else {
            // Determine tier based strictly on the price ID, fallback to customData
            const isAgencyPrice = priceId && (priceId === AGENCY_MONTHLY_ID || priceId === AGENCY_YEARLY_ID);
            const isProPrice = priceId && (priceId === PRO_MONTHLY_ID || priceId === PRO_YEARLY_ID);

            // Resolve final tier — Agency check FIRST to prevent Pro fallthrough
            let finalTier = "PRO";
            let creditsToAdd = 500;

            if (isAgencyPrice || tier === "AGENCY") {
              finalTier = "AGENCY";
              creditsToAdd = 6000;
            } else if (isProPrice || tier === "PRO") {
              finalTier = "PRO";
              creditsToAdd = 500;
            } else if (!tier && !isAgencyPrice && !isProPrice) {
               console.log(`⚠️ Unrecognized purchase type for user: ${userId}. priceId=${priceId}, tier=${tier}`);
               return NextResponse.json({ received: true }, { status: 200 });
            }

            console.log(`✅ [Tier Resolution] priceId=${priceId} | FINAL: ${finalTier} (${creditsToAdd} credits)`);

            await db.creator.upsert({
              where: { id: userId },
              update: {
                tier: finalTier,
                aiCredits: creditsToAdd,
                has_completed_pricing: true,
                has_completed_onboarding: true,
                ...(paddleSubscriptionId && { paddleSubscriptionId })
              },
              create: {
                id: userId,
                email: `${userId}@test.com`, // Fallback fake email for sandbox testing seeds
                name: "Test Creator",
                tier: finalTier,
                aiCredits: creditsToAdd,
                has_completed_onboarding: true,
                has_completed_pricing: true,
                paddleSubscriptionId
              },
            });

            console.log(`💾 Database successfully synchronized in Supabase for creator tier upgrade: ${userId}!`);
          }
        } catch (prismaError) {
          console.error("❌ Prisma database update failed:", prismaError);
        }
        
      } else {
        console.error("❌ [Webhook Error] Webhook parsed successfully, but NO userId was found! Payload customData:", customData);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // SUBSCRIPTION LIFECYCLE: Cancellation & Failed Payments
    // ═══════════════════════════════════════════════════════════
    if (eventType === "subscription.canceled") {
      const subscriptionId = payload.data?.id || payload.data?.subscription_id || null;
      const customData = payload.data?.custom_data || payload.custom_data;
      const userId = customData?.userId;

      console.log(`[Paddle Webhook] Subscription canceled: ${subscriptionId} for user: ${userId || "UNKNOWN"}`);

      if (userId) {
        try {
          await db.creator.update({
            where: { id: userId },
            data: {
              tier: "FREE",
              paddleSubscriptionId: null,
            },
          });
          console.log(`[Paddle Webhook] User ${userId} downgraded to FREE tier after subscription cancellation.`);
        } catch (prismaError) {
          console.error("[Paddle Webhook] Failed to downgrade user after cancellation:", prismaError);
        }
      } else if (subscriptionId) {
        // Fallback: find creator by paddleSubscriptionId if customData is missing
        try {
          const creator = await db.creator.findFirst({
            where: { paddleSubscriptionId: subscriptionId },
            select: { id: true },
          });
          if (creator) {
            await db.creator.update({
              where: { id: creator.id },
              data: {
                tier: "FREE",
                paddleSubscriptionId: null,
              },
            });
            console.log(`[Paddle Webhook] Creator ${creator.id} downgraded to FREE via subscription ID lookup.`);
          }
        } catch (lookupError) {
          console.error("[Paddle Webhook] Subscription ID lookup fallback failed:", lookupError);
        }
      }
    }

    if (eventType === "subscription.past_due" || eventType === "subscription.payment_method_change") {
      const subscriptionId = payload.data?.id || payload.data?.subscription_id || null;
      const customData = payload.data?.custom_data || payload.custom_data;
      const userId = customData?.userId;

      console.warn(`[Paddle Webhook] Subscription payment issue (${eventType}): ${subscriptionId} for user: ${userId || "UNKNOWN"}`);

      // For past_due, we downgrade to FREE to prevent unpaid access
      if (eventType === "subscription.past_due" && (userId || subscriptionId)) {
        try {
          const whereClause = userId
            ? { id: userId }
            : { paddleSubscriptionId: subscriptionId };

          const targetCreator = await db.creator.findFirst({
            where: whereClause,
            select: { id: true },
          });

          if (targetCreator) {
            await db.creator.update({
              where: { id: targetCreator.id },
              data: { tier: "FREE" },
            });
            console.log(`[Paddle Webhook] Creator ${targetCreator.id} downgraded to FREE due to past_due payment.`);
          }
        } catch (pastDueError) {
          console.error("[Paddle Webhook] Failed to handle past_due downgrade:", pastDueError);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook handler encountered an error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}