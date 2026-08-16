import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { consumeCredits } from "@/utils/credits";
import { aiRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { withIdempotency } from "@/lib/idempotency";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUser } from "@/lib/extension-auth";
import { getSession } from "@/utils/supabase/server";

// --- Validation Schema ---
const LanguageTranslatorSchema = z.object({
  translatedText: z.string().min(1, "Translation cannot be empty"),
  detectedLanguage: z.string(),
  confidenceScore: z.number().min(0).max(1),
  translationNotes: z.string().optional() // For explaining slang, idioms, or context
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

    // --- Dual-Auth: Web Session -> Extension API Key Fallback ---
    const { db } = await import("@/lib/db");
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
      Sentry.captureException(new Error(`RBAC Alert: Unregistered user ${activeUser.id} attempted Language Translator.`));
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // --- 3. Request Parsing ---
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      return NextResponse.json({ error: "Invalid request body format." }, { status: 400 });
    }

    const { textToTranslate, targetLanguage } = body;

    if (!textToTranslate || !targetLanguage) {
      return NextResponse.json({ error: "Missing textToTranslate or targetLanguage" }, { status: 400 });
    }

    // Attempt to consume credits
    let creditResult;
    try {
      creditResult = await consumeCredits(activeUser.id, "TRANSLATOR");
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

    const prompt = `You are an expert translator specializing in casual, flirty, and colloquial language (e.g., OnlyFans interactions).
Translate the following text into ${targetLanguage}. Capture the exact tone and nuance of the original message.

TEXT TO TRANSLATE:
"${textToTranslate}"

CRITICAL RULES:
1. Provide the translated text natively, maintaining the flirty/casual tone.
2. Identify the detected source language.
3. Provide a confidence score between 0 and 1.
4. Optionally provide translationNotes if there are slang, idioms, or cultural nuances the sender should know about.
5. You MUST return your entire response as a valid JSON object matching the following structure:
{
  "translatedText": "The actual translation",
  "detectedLanguage": "The source language detected",
  "confidenceScore": 0.95,
  "translationNotes": "Optional notes on slang or nuance"
}
Return ONLY valid JSON.`;

    let validatedData;

    try {
      // --- TIER 1: Primary High-Speed Extraction ---
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const responseText = completion.choices[0]?.message?.content || "{}";
      const parsedJson = JSON.parse(responseText);
      
      const validationResult = LanguageTranslatorSchema.safeParse(parsedJson);
      
      if (!validationResult.success) {
        throw new ValidationError("Tier 1 Zod validation failed: " + validationResult.error.message);
      }
      
      validatedData = validationResult.data;

    } catch (tier1Error: any) {
      // Trigger Tier 2 Fallback
      Sentry.captureException(tier1Error, { tags: { fallback: "tier_2_triggered", feature: "language_translator" } });
      console.warn("[TRANSLATOR_ERROR] Tier 1 failed, trying Tier 2:", tier1Error.message);
      
      try {
        // --- TIER 2: Heavy Backup Model ---
        const completionTier2 = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile", // More capable fallback model
          temperature: 0.3,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });
        
        const responseTextTier2 = completionTier2.choices[0]?.message?.content || "{}";
        const parsedJsonTier2 = JSON.parse(responseTextTier2);
        
        const validationResultTier2 = LanguageTranslatorSchema.safeParse(parsedJsonTier2);
        
        if (!validationResultTier2.success) {
          throw new ValidationError("Tier 2 Zod validation failed: " + validationResultTier2.error.message);
        }
        
        validatedData = validationResultTier2.data;

      } catch (tier2Error: any) {
        // EXPOSE REAL ERROR
        Sentry.captureException(tier2Error, { tags: { fallback: "failed" } });
        console.error("[Groq Translator Error]: Tier 2 failed.", tier2Error.message);
        throw tier2Error;
      }
    }

    return NextResponse.json({ 
      success: true,
      data: validatedData,
      remainingCredits: creditResult.remainingCredits 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[TRANSLATOR_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return withIdempotency(req, coreHandler);
}
