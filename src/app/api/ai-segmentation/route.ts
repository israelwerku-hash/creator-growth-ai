import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { consumeCredits } from "@/utils/credits";
import { aiRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { withIdempotency } from "@/lib/idempotency";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import DOMPurify from 'isomorphic-dompurify';
import { getAuthenticatedUser } from "@/lib/extension-auth";
import { getSession } from "@/utils/supabase/server";
// --- Validation Schema ---
const AiSegmentationSchema = z.object({
  segments: z.array(z.enum([
    "whale", 
    "active_spender", 
    "lurker", 
    "churn_risk", 
    "new_lead", 
    "highly_engaged"
  ])).max(3),
  engagementScore: z.number().int().min(0).max(100),
  segmentationReasoning: z.string().max(150, "Reasoning too long").optional()
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
    // --- 1. Rate Limiting ---
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

    // --- 2. RBAC Authorization Check ---
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

    const creatorRecord = await db.creator.findUnique({
      where: { id: activeUser.id },
      select: { role: true }
    });

    if (!creatorRecord) {
      Sentry.captureException(new Error(`RBAC Alert: Unregistered user ${activeUser.id} attempted AI Segmentation.`));
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // --- 3. Request Parsing ---
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json({ error: "Invalid request body format." }, { status: 400 });
    }

    let { creatorId, fanId, chatHistory, spendingBehavior } = body;

    if (!creatorId || !fanId || !chatHistory) {
      return NextResponse.json({ error: "Missing creatorId, fanId, or chatHistory" }, { status: 400 });
    }

    // XSS Neutralization
    chatHistory = DOMPurify.sanitize(chatHistory);

    // --- IDOR / Resource Ownership Check ---
    const fanCheck = await db.fan.findUnique({ where: { id: fanId }, select: { creatorId: true } });
    if (!fanCheck || fanCheck.creatorId !== activeUser.id) {
      // Return 404 to obscure existence of unauthorized resources
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Attempt to consume credits
    let creditResult;
    try {
      creditResult = await consumeCredits(activeUser.id, "SEGMENTATION");
    } catch (creditError: any) {
      return NextResponse.json({ error: "Credit system error." }, { status: 500 });
    }
    
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Insufficient credits.", requiresUpgrade: creditResult.requiresUpgrade },
        { status: 402 }
      );
    }

    // --- 3. AI Setup ---
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI Engine is not configured." }, { status: 500 });
    }
    const groq = new Groq({ apiKey });

    const prompt = `You are an elite OnlyFans CRM AI. Analyze this fan's chat history and spending behavior to determine their marketing segment.
Chat History: ${typeof chatHistory === 'string' ? chatHistory : JSON.stringify(chatHistory)}
Spending Data: ${spendingBehavior || "No spending data available"}

CRITICAL RULES:
1. Provide up to 3 descriptive segments from the exact allowed list.
2. Determine an engagementScore from 0-100 based on their responsiveness and spend.
3. Provide a brief segmentationReasoning explaining your logic.
4. You MUST return your entire response as a valid JSON object matching the following structure:
{
  "segments": ["must be chosen from: whale, active_spender, lurker, churn_risk, new_lead, highly_engaged"],
  "engagementScore": 50,
  "segmentationReasoning": "Brief explanation (MAXIMUM 140 characters)"
}
Return ONLY valid JSON.`;

    let validatedData;

    try {
      // --- TIER 1: Primary High-Speed Extraction ---
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsedJson = JSON.parse(responseText);
      
      const validationResult = AiSegmentationSchema.safeParse(parsedJson);
      
      if (!validationResult.success) {
        throw new ValidationError("Tier 1 Zod validation failed: " + validationResult.error.message);
      }
      
      validatedData = validationResult.data;

    } catch (tier1Error: any) {
      // Trigger Tier 2 Fallback
      Sentry.captureException(tier1Error, { tags: { fallback: "tier_2_triggered", feature: "ai_segmentation" } });
      console.warn("[SEGMENTATION_ERROR] Tier 1 failed, trying Tier 2:", tier1Error.message);
      
      try {
        // --- TIER 2: Heavy Backup Model ---
        const completionTier2 = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", // More capable fallback model
          temperature: 0.1,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });
        
        const responseTextTier2 = completionTier2.choices[0]?.message?.content || "{}";
        const parsedJsonTier2 = JSON.parse(responseTextTier2);
        
        const validationResultTier2 = AiSegmentationSchema.safeParse(parsedJsonTier2);
        
        if (!validationResultTier2.success) {
          throw new ValidationError("Tier 2 Zod validation failed: " + validationResultTier2.error.message);
        }
        
        validatedData = validationResultTier2.data;

      } catch (tier2Error: any) {
        // EXPOSE REAL ERROR
        Sentry.captureException(tier2Error, { tags: { fallback: "failed" } });
        console.error("[Groq Segmentation Error]: Tier 2 failed.", tier2Error.message);
        throw tier2Error;
      }
    }

    // --- 4. Database Mutations (Stubbed for Best Practices) ---
    try {
      // Update Fan Profile with the primary segment and scores
      const primarySegment = validatedData.segments[0] || "lurker";
      
      await db.fan.updateMany({
        where: { id: fanId, creatorId: activeUser.id },
        data: {
          segment: primarySegment,
          engagementScore: validatedData.engagementScore,
          aiRecommendation: validatedData.segmentationReasoning || "Awaiting analytical execution scan cycle."
        }
      });
    } catch (dbError: any) {
      console.error("[SEGMENTATION_ERROR] Database mutation failed:", dbError.message);
      // Let the system know it failed to save, but return successful response to client
      Sentry.captureException(dbError);
    }

    return NextResponse.json({ 
      success: true,
      data: validatedData,
      remainingCredits: creditResult.remainingCredits 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[SEGMENTATION_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return withIdempotency(req, coreHandler);
}
