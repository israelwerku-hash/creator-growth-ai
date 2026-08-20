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
import { parseAIJson } from "@/lib/ai-json";

// --- Validation Schema ---
const MemoryVaultSchema = z.object({
  fanSummary: z.string().max(200, "Summary too long"),
  keyInterests: z.array(z.string()).max(5),
  spendingSentiment: z.enum(["high_roller", "hesitant", "window_shopper", "unknown"]),
  extractedFacts: z.array(z.string()).max(10),
  suggestedAction: z.string().optional()
});

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}





export async function GET(req: Request) {
  try {
    const activeUser = await getAuthenticatedUser(req as any);
    if (!activeUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid API Key" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawFanId = searchParams.get("fanId");

    if (!rawFanId) {
      return NextResponse.json({ error: "Missing fanId" }, { status: 400 });
    }

    const fanId = rawFanId.trim().toLowerCase();

    try {
      const vaultItems = await db.fanMemory.findMany({
        where: { 
          fanId,
          fan: { creatorId: activeUser.id }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ vault: vaultItems }, { status: 200 });
    } catch (dbErr: any) {
      console.error('[VAULT_DB_ERROR_DETAILS]', dbErr);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[VAULT_GET_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    // In dev mode, we bypass the creator role DB check if it's the mock user
    if (process.env.NODE_ENV !== "development" || activeUser.id !== "mock_developer_id") {
      try {
        const creatorRecord = await db.creator.findUnique({
          where: { id: activeUser.id },
          select: { role: true }
        });

        if (!creatorRecord) {
          Sentry.captureException(new Error(`RBAC Alert: Unregistered user ${activeUser.id} attempted Memory Vault.`));
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      } catch (dbErr: any) {
        console.error("[VAULT_POST_RBAC_ERROR]", dbErr.message);
        if (process.env.NODE_ENV === "development") {
          console.warn("[VAULT_POST] Creator lookup failed, bypassing in development.");
        } else {
          throw dbErr;
        }
      }
    }

    // --- 3. Request Parsing ---
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json({ error: "Invalid request body format." }, { status: 400 });
    }

    let { creatorId, fanId: rawFanId, chatHistory, snippet } = body;
    // If they just passed a snippet from the sidepanel instead of chat history:
    if (snippet && !chatHistory) {
      chatHistory = snippet;
    }

    if (!rawFanId || !chatHistory) {
      return NextResponse.json({ error: "Missing fanId or chat context" }, { status: 400 });
    }

    // Normalize fanId
    const fanId = rawFanId.trim().toLowerCase();
    
    // XSS Neutralization
    chatHistory = DOMPurify.sanitize(chatHistory);

    // --- IDOR / Resource Ownership Check ---
    if (process.env.NODE_ENV !== "development" || activeUser.id !== "mock_developer_id") {
      try {
        const fanCheck = await db.fan.findUnique({ where: { id: fanId }, select: { creatorId: true } });
        // If it exists but belongs to someone else, reject.
        if (fanCheck && fanCheck.creatorId !== activeUser.id) {
          return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }
      } catch (dbErr: any) {
        console.error("[VAULT_POST_IDOR_ERROR]", dbErr.message);
        if (process.env.NODE_ENV === "development") {
           console.warn("[VAULT_POST] Fan ownership lookup failed, bypassing in development.");
        } else {
           throw dbErr;
        }
      }
    }

    let creditResult: any = { success: true, remainingCredits: 100, error: "", requiresUpgrade: false };
    try {
      creditResult = await consumeCredits(activeUser.id, "MEMORY_VAULT");
      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.error || "Insufficient credits.", requiresUpgrade: creditResult.requiresUpgrade },
          { status: 402 }
        );
      }
    } catch (creditError: any) {
      return NextResponse.json({ error: "Credit system error." }, { status: 500 });
    }

    // --- 3. AI Setup ---
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI Engine is not configured." }, { status: 500 });
    }
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are an elite OnlyFans CRM analyst. You MUST respond with valid JSON only. No markdown, no code fences.
Your response must be a single JSON object with exactly these keys:
{
  "fanSummary": "Brief overview",
  "keyInterests": ["interest 1", "interest 2"],
  "spendingSentiment": "must be ONE of: high_roller, hesitant, window_shopper, unknown",
  "extractedFacts": ["fact 1", "fact 2"],
  "suggestedAction": "Optional recommendation"
}`;

    const userPrompt = `Analyze this chat history/snippet and extract memory vault data.
Chat History: ${typeof chatHistory === 'string' ? chatHistory : JSON.stringify(chatHistory)}

CRITICAL RULES:
1. Extract the fan's key interests and indisputable facts.
2. Determine their spending sentiment based on the conversation.
Respond with valid json in the exact format required.`;

    let validatedData;

    try {
      // --- TIER 1: Primary High-Speed Extraction ---
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsedJson = parseAIJson(responseText);
      
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
        const completionTier2 = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 400,
          response_format: { type: "json_object" }
        });
        
        const responseTextTier2 = completionTier2.choices[0]?.message?.content || "{}";
        const parsedJsonTier2 = parseAIJson(responseTextTier2);
        const validationResultTier2 = MemoryVaultSchema.safeParse(parsedJsonTier2);
        
        if (!validationResultTier2.success) {
          throw new ValidationError("Tier 2 Zod validation failed: " + validationResultTier2.error.message);
        }
        validatedData = validationResultTier2.data;
      } catch (tier2Error: any) {
        Sentry.captureException(tier2Error, { tags: { fallback: "failed" } });
        console.error("[Groq Memory Vault Error]: Tier 2 failed.", tier2Error.message);
        throw tier2Error;
      }
    }

    // --- 4. Database Mutations (Wrapped securely) ---
    try {
      // Ensure the Creator record exists to satisfy Fan.creatorId foreign key
      await db.creator.upsert({
        where: { id: activeUser.id },
        update: {},
        create: {
          id: activeUser.id,
          email: `${activeUser.id}@dev.local`,
          name: activeUser.id === "mock_developer_id" ? "Dev Creator" : activeUser.id,
          role: "CREATOR",
          status: "ACTIVE",
          tier: "FREE"
        }
      });

      // Upsert Fan to satisfy FanMemory.fanId foreign key
      await db.fan.upsert({
        where: { id: fanId },
        update: {
          segment: validatedData.spendingSentiment,
          aiRecommendation: validatedData.suggestedAction || "Continue normal engagement."
        },
        create: {
          id: fanId,
          creatorId: activeUser.id,
          username: fanId,
          displayName: fanId,
          segment: validatedData.spendingSentiment,
          aiRecommendation: validatedData.suggestedAction || "Continue normal engagement."
        }
      });

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

      // If no AI facts but we had a raw snippet, just store the snippet
      if (memoriesToInsert.length === 0 && snippet) {
         memoriesToInsert.push({ fanId, category: "Manual", keyFact: snippet, isPriority: true });
      }

      if (memoriesToInsert.length > 0) {
        await db.fanMemory.createMany({
          data: memoriesToInsert,
          skipDuplicates: true
        });
        console.log('[VAULT_SAVE] Saved memory for fan:', fanId, memoriesToInsert);
      }

    } catch (dbError: any) {
      console.error('[VAULT_DB_ERROR_DETAILS]', dbError);
      Sentry.captureException(dbError);
      return NextResponse.json(
        { error: "Failed to save memory to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: validatedData,
      remainingCredits: creditResult.remainingCredits 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[MEMORY_VAULT_ERROR] Unhandled exception:", error.message, error.stack);
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
  // Edge runtime CORS preflight fallback (though middleware typically handles this)
  return NextResponse.json({}, { status: 200 });
}
