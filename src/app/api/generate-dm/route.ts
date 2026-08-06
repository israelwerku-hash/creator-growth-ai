import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeCredits } from "@/utils/credits";
import { aiRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { withIdempotency } from "@/lib/idempotency";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUser } from "@/lib/extension-auth";
import { getSession } from "@/utils/supabase/server";
import { Client } from "@upstash/qstash";
import { redis } from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

// Initialize QStash Client
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "mock_token",
});

async function coreHandler(req: Request) {
  try {
    // --- Rate Limiting (before anything else) ---
    const identifier = getRequestIdentifier(req);
    const { success: withinLimit, limit, reset, remaining } = await aiRateLimiter.limit(identifier);

    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // --- Dual-Auth: Web Session -> Extension API Key Fallback ---
    let activeUser = null;
    
    // 1. Try Web Session
    const session = await getSession().catch(() => null);
    if (session?.user?.id) {
      activeUser = await db.creator.findUnique({ where: { id: session.user.id } });
    }

    // 2. Try Extension API Key
    if (!activeUser) {
      activeUser = await getAuthenticatedUser(req as any);
    }

    if (!activeUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid Session / API Key" }, { status: 401 });
    }

    if (process.env.NODE_ENV !== "development" || activeUser.id !== "mock_developer_id") {
      try {
        const creatorRecord = await db.creator.findUnique({
          where: { id: activeUser.id },
          select: { role: true }
        });

        if (!creatorRecord) {
          Sentry.captureException(new Error(`RBAC Alert: Unregistered user ${activeUser.id} attempted DM generation.`));
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      } catch (dbErr: any) {
        console.error("[DM_GEN_RBAC_ERROR]", dbErr.message);
        if (process.env.NODE_ENV === "development") {
          console.warn("[DM_GEN] Creator lookup failed, bypassing in development.");
        } else {
          throw dbErr;
        }
      }
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error("[DM_GENERATION_ERROR] Failed to parse request body:", parseError.message);
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { targetAccount, campaignGoal, tone, context, fanId: rawFanId } = body;
    const fanId = rawFanId ? rawFanId.trim().toLowerCase() : null;

    if (!targetAccount || !campaignGoal || !tone) {
      return NextResponse.json(
        { error: `Missing required fields: ${[!targetAccount && 'targetAccount', !campaignGoal && 'campaignGoal', !tone && 'tone'].filter(Boolean).join(', ')}` },
        { status: 400 }
      );
    }

    // Attempt to consume credits upfront
    let creditResult: { success: boolean; remainingCredits?: number; error?: string; requiresUpgrade?: boolean } | null = null;
    try {
      creditResult = await consumeCredits(activeUser.id, "DM_GENERATION");
      if (!creditResult || !creditResult.success) {
        return NextResponse.json(
          { error: creditResult?.error || "Insufficient credits.", requiresUpgrade: creditResult?.requiresUpgrade },
          { status: 402 }
        );
      }
    } catch (creditError: any) {
      console.error("[DM_GENERATION_ERROR] Credit system threw an exception:", creditError.message, creditError.stack);
      return NextResponse.json(
        { error: "Credit system error." },
        { status: 500 }
      );
    }

    // --- Generate Job ID & Set Redis State ---
    const jobId = uuidv4();
    
    // Save initial state to Redis with 1 hour expiry
    await redis.set(
      `job:${jobId}`,
      JSON.stringify({
        status: "PROCESSING",
        creditsRemaining: creditResult.remainingCredits,
      }),
      { ex: 3600 }
    );

    // --- Dispatch to QStash ---
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    try {
      await qstashClient.publishJSON({
        url: `${appUrl}/api/jobs/process-ai`,
        body: {
          jobId,
          userId: activeUser.id,
          targetAccount,
          campaignGoal,
          tone,
          context,
          fanId,
          creditsRemaining: creditResult.remainingCredits,
        },
      });
    } catch (qstashError: any) {
      console.error("[DM_GENERATION_ERROR] Failed to publish to QStash:", qstashError);
      
      // Refund credits since dispatch failed
      await db.creator.update({
        where: { id: activeUser.id },
        data: { aiCredits: { increment: 1 } }, // DM_GENERATION costs 1
      });

      await redis.set(`job:${jobId}`, JSON.stringify({ status: "FAILED", error: "Failed to queue job" }), { ex: 3600 });
      return NextResponse.json({ error: "Failed to queue AI generation task." }, { status: 500 });
    }

    // Return the Job ID immediately
    return NextResponse.json({ 
      success: true,
      jobId,
      status: "PROCESSING",
      remainingCredits: creditResult!.remainingCredits,
    }, { status: 202 });

  } catch (error: any) {
    console.error("[DM_GENERATION_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return withIdempotency(req, coreHandler);
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { status: 200 });
}

