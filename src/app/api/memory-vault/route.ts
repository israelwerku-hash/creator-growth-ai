import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { consumeCredits } from "@/utils/credits";
import { aiRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { withIdempotency } from "@/lib/idempotency";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import DOMPurify from 'isomorphic-dompurify';

// --- Validation Schema ---
const MemoryVaultSchema = z.object({
  fanSummary: z.string().max(200, "Summary too long"),
  keyInterests: z.array(z.string()).max(5),
  spendingSentiment: z.enum(["high_roller", "hesitant", "window_shopper", "unknown"]),
  extractedFacts: z.array(z.string()).max(10),
  suggestedAction: z.string().optional()
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
    const { requireAuth } = await import("@/utils/supabase/server");
    const { db } = await import("@/lib/db");
    
    let activeUser;
    try {
      activeUser = await requireAuth();
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creatorRecord = await db.creator.findUnique({
      where: { id: activeUser.id },
      select: { role: true }
    });

    if (!creatorRecord) {
      Sentry.captureException(new Error(`RBAC Alert: Unregistered user ${activeUser.id} attempted Memory Vault.`));
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // --- 3. Request Parsing ---
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json({ error: "Invalid request body format." }, { status: 400 });
    }

    let { creatorId, fanId, chatHistory } = body;

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
      creditResult = await consumeCredits("MEMORY_VAULT");
    } catch (creditError: any) {
      return NextResponse.json({ error: `Credit system error: ${creditError.message}` }, { status: 500 });
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

    const prompt = `You are an elite OnlyFans CRM analyst. Analyze this chat history and extract memory vault data.
Chat History: ${typeof chatHistory === 'string' ? chatHistory : JSON.stringify(chatHistory)}

CRITICAL RULES:
1. Extract the fan's key interests and indisputable facts.
2. Determine their spending sentiment based on the conversation.
3. You MUST return your entire response as a valid JSON object matching the following structure:
{
  "fanSummary": "Brief overview",
  "keyInterests": ["interest 1", "interest 2"],
  "spendingSentiment": "must be ONE of: high_roller, hesitant, window_shopper, unknown",
  "extractedFacts": ["fact 1", "fact 2"],
  "suggestedAction": "Optional recommendation"
}
Return ONLY valid JSON.`;

    let validatedData;

    try {
      // --- TIER 1: Primary High-Speed Extraction ---
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsedJson = JSON.parse(responseText);
      
      const validationResult = MemoryVaultSchema.safeParse(parsedJson);
      
      if (!validationResult.success) {
        throw new ValidationError("Tier 1 Zod validation failed: " + validationResult.error.message);
      }
      
      validatedData = validationResult.data;

    } catch (tier1Error: any) {
      // Trigger Tier 2 Fallback
      Sentry.captureException(tier1Error, { tags: { fallback: "tier_2_triggered", feature: "memory_vault" } });
      console.warn("[MEMORY_VAULT_ERROR] Tier 1 failed, trying Tier 2:", tier1Error.message);
      
      try {
        // --- TIER 2: Heavy Backup Model ---
        const completionTier2 = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", // More capable fallback model
          temperature: 0.1, // Even stricter parsing
          max_tokens: 400,
          response_format: { type: "json_object" }
        });
        
        const responseTextTier2 = completionTier2.choices[0]?.message?.content || "{}";
        const parsedJsonTier2 = JSON.parse(responseTextTier2);
        
        const validationResultTier2 = MemoryVaultSchema.safeParse(parsedJsonTier2);
        
        if (!validationResultTier2.success) {
          throw new ValidationError("Tier 2 Zod validation failed: " + validationResultTier2.error.message);
        }
        
        validatedData = validationResultTier2.data;

      } catch (tier2Error: any) {
        // EXPOSE REAL ERROR
        Sentry.captureException(tier2Error, { tags: { fallback: "failed" } });
        console.error("[Groq Memory Vault Error]: Tier 2 failed.", tier2Error.message);
        throw tier2Error;
      }
    }

    // --- 4. Database Mutations (Stubbed for Best Practices) ---
    try {
      // Update Fan Profile
      await db.fan.update({
        where: { id: fanId },
        data: {
          segment: validatedData.spendingSentiment,
          aiRecommendation: validatedData.suggestedAction || "Continue normal engagement."
        }
      });

      // Insert Extracted Memories (Interests & Facts)
      const memoriesToInsert = [
        ...validatedData.keyInterests.map(interest => ({
          fanId,
          category: "Interest",
          keyFact: interest,
          isPriority: true
        })),
        ...validatedData.extractedFacts.map(fact => ({
          fanId,
          category: "Fact",
          keyFact: fact,
          isPriority: false
        }))
      ];

      if (memoriesToInsert.length > 0) {
        await db.fanMemory.createMany({
          data: memoriesToInsert,
          skipDuplicates: true
        });
      }

    } catch (dbError: any) {
      console.error("[MEMORY_VAULT_ERROR] Database mutation failed:", dbError.message);
      // We don't crash, we just let the system know it failed to save
      Sentry.captureException(dbError);
    }

    return NextResponse.json({ 
      success: true,
      data: validatedData,
      remainingCredits: creditResult.remainingCredits 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[MEMORY_VAULT_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return withIdempotency(req, coreHandler);
}
