import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { consumeCredits } from "@/utils/credits";
import { revalidatePath } from "next/cache";
import { aiRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { withIdempotency } from "@/lib/idempotency";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import DOMPurify from 'isomorphic-dompurify';
import { getAuthenticatedUser } from "@/lib/extension-auth";
import { getSession } from "@/utils/supabase/server";

// --- Validation Schema ---
const DmGenerationSchema = z.object({
  messageBody: z.string().min(10, "Message is too short").max(1000, "Message exceeds character limits"),
  toneDetected: z.enum(["flirty", "casual", "urgent", "promotional", "appreciative"]),
  includesCallToAction: z.boolean(),
  suggestedUnlockPrice: z.number().int().optional(),
  campaignTags: z.array(z.string()).max(3)
});

// --- No Static Fallback ---

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

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

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("[DM_GENERATION_ERROR] GROQ_API_KEY is not set in environment.");
      return NextResponse.json(
        { error: "AI Engine is not configured on the server." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

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
      console.error("[DM_GENERATION_ERROR] Missing required fields:", { targetAccount, campaignGoal, tone });
      return NextResponse.json(
        { error: `Missing required fields: ${[!targetAccount && 'targetAccount', !campaignGoal && 'campaignGoal', !tone && 'tone'].filter(Boolean).join(', ')}` },
        { status: 400 }
      );
    }

    // Attempt to consume credits — STRICT enforcement, no defaults
    let creditResult: { success: boolean; remainingCredits?: number; error?: string; requiresUpgrade?: boolean } | null = null;
    try {
      // Consume credits passing the authenticated userId
      creditResult = await consumeCredits(activeUser.id, "DM_GENERATION");
      if (!creditResult || !creditResult.success) {
        console.error("[DM_GENERATION_ERROR] Credit check failed:", creditResult?.error);
        return NextResponse.json(
          { error: creditResult?.error || "Insufficient credits.", requiresUpgrade: creditResult?.requiresUpgrade },
          { status: 402 }
        );
      }
    } catch (creditError: any) {
      console.error("[DM_GENERATION_ERROR] Credit system threw an exception:", creditError.message, creditError.stack);
      return NextResponse.json(
        { error: `Credit system error: ${creditError.message}` },
        { status: 500 }
      );
    }

    // --- Fetch Fan Memories from Vault (identical query to GET /api/memory-vault) ---
    let fanMemoriesSection = "";
    if (fanId) {
      try {
        const fan = await db.fan.findFirst({
          where: { 
            OR: [{ id: fanId }, { username: fanId }],
            creatorId: activeUser.id
          }
        });

        const resolvedFanId = fan ? fan.id : fanId;

        const memories = await db.fanMemory.findMany({
          where: { fanId: resolvedFanId },
          orderBy: { createdAt: 'desc' }
        });

        console.log('[DM_GEN_RESOLVED_FAN]', { inputFanId: fanId, resolvedFanId: fan?.id, memoryCount: memories.length });

        if (memories.length > 0) {
          const facts = memories.map((m: any) => `- ${m.keyFact}`).join("\n");
          fanMemoriesSection = `\n\nFAN MEMORIES & PREFERENCES (CRITICAL — you MUST incorporate these into your message):\n${facts}`;
        }
      } catch (memErr: any) {
        console.error("[DM_GEN_VAULT_ERROR] Prisma fanMemory query failed:", memErr.message, memErr.stack);
        if (process.env.NODE_ENV === "development") {
          console.warn("[DM_GEN] Fan memory DB lookup failed. Continuing without vault context.");
        }
      }
    }

    const prompt = `You are an elite, high-end creator agency outreach strategist.
Your task is to generate a highly personalized, compelling, and natural-sounding direct message (DM) for an outreach campaign.
Write it as if you are sending it directly to the target. If you don't know their specific name, use a natural greeting that avoids generic brackets like [Name].

TARGET INDUSTRY / ACCOUNT: ${targetAccount}
CAMPAIGN GOAL: ${campaignGoal}
TONE & VIBE: ${tone}
CONTEXT / HOOK: ${context || "Rely strictly on the industry and goal."}${fanMemoriesSection}

CRITICAL RULES:
1. The message must perfectly match the requested tone and vibe.
2. CRITICAL: You MUST incorporate the fan's specific vault preferences/memories into the outreach message to make it personalized, rather than sending a generic message. Reference their interests, facts, or preferences directly.
3. Keep it concise, punchy, and highly readable (maximum 150 words).
4. Do not include any meta-commentary, introductory text, or quotation marks.
5. You MUST return your entire response as a valid JSON object matching the following structure:
{
  "messageBody": "The actual DM message",
  "toneDetected": "Must be ONE of: flirty, casual, urgent, promotional, appreciative",
  "includesCallToAction": true or false,
  "campaignTags": ["tag1", "tag2", "tag3"] // max 3 tags
}
Return ONLY valid JSON.`;

    let validatedData;

    try {
      // --- TIER 1: Primary High-Speed Execution ---
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsedJson = JSON.parse(responseText);
      
      const validationResult = DmGenerationSchema.safeParse(parsedJson);
      
      if (!validationResult.success) {
        throw new ValidationError("Tier 1 Zod validation failed: " + validationResult.error.message);
      }
      
      validatedData = validationResult.data;

    } catch (tier1Error: any) {
      // Trigger Tier 2 Fallback
      Sentry.captureException(tier1Error, { tags: { fallback: "tier_2_triggered" } });
      console.warn("[DM_GENERATION_ERROR] Tier 1 failed, trying Tier 2:", tier1Error.message);
      
      try {
        // --- TIER 2: Heavy Backup Model ---
        const completionTier2 = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", // More capable fallback model
          temperature: 0.5,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });
        
        const responseTextTier2 = completionTier2.choices[0]?.message?.content || "{}";
        const parsedJsonTier2 = JSON.parse(responseTextTier2);
        
        const validationResultTier2 = DmGenerationSchema.safeParse(parsedJsonTier2);
        
        if (!validationResultTier2.success) {
          throw new ValidationError("Tier 2 Zod validation failed: " + validationResultTier2.error.message);
        }
        
        validatedData = validationResultTier2.data;

      } catch (tier2Error: any) {
        // EXPOSE REAL ERROR
        Sentry.captureException(tier2Error, { tags: { fallback: "failed" } });
        console.error("[Groq DM Gen Error]: Tier 2 failed.", tier2Error.message);
        throw tier2Error;
      }
    }

    return NextResponse.json({ 
      success: true,
      output: validatedData.messageBody,
      messageBody: validatedData.messageBody,
      toneDetected: validatedData.toneDetected,
      includesCallToAction: validatedData.includesCallToAction,
      campaignTags: validatedData.campaignTags,
      remainingCredits: creditResult!.remainingCredits,
      creditsRemaining: creditResult!.remainingCredits,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[DM_GENERATION_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
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
