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

    // 1. Verify credits BEFORE doing work, but do NOT consume yet
    const creatorStatus = await db.creator.findUnique({
      where: { id: activeUser.id },
      select: { aiCredits: true }
    });
    if (!creatorStatus || creatorStatus.aiCredits < 1) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    // 2. Fetch Fan Memories
    let fanMemoriesSection = "";
    if (fanId) {
      try {
        const fan = await db.fan.findFirst({
          where: { OR: [{ id: fanId }, { username: fanId }], creatorId: activeUser.id }
        });
        if (fan) {
          const memories = await db.fanMemory.findMany({
            where: { fanId: fan.id },
            orderBy: { createdAt: 'desc' }
          });
          if (memories.length > 0) {
            const facts = memories.map((m: any) => `- ${m.keyFact}`).join("\n");
            fanMemoriesSection = `\n\nFAN MEMORIES & PREFERENCES:\n${facts}`;
          }
        }
      } catch (e) {
        console.warn("[DM_GEN] Failed to fetch memories", e);
      }
    }

    // 3. Generate via AI
    const Groq = (await import("groq-sdk")).default;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("AI Engine is not configured.");
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are an elite creator agency outreach strategist. You MUST respond with valid JSON only. No markdown, no code fences, no explanation text outside the JSON object. Your response must be a single JSON object with exactly these keys: "messageBody" (string), "toneDetected" (string), "campaignTags" (array of strings).`;

    const userPrompt = `Generate a highly personalized, natural-sounding DM for an outreach campaign.
TARGET INDUSTRY: ${targetAccount}
CAMPAIGN GOAL: ${campaignGoal}
TONE & VIBE: ${tone}
CONTEXT / HOOK: ${context || "Rely strictly on the industry and goal."}${fanMemoriesSection}

CRITICAL RULES: Keep it concise (max 150 words).
Respond with valid json in this exact format: { "messageBody": "...", "toneDetected": "...", "campaignTags": ["t1", "t2"] }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    // Safe JSON parsing with markdown code fence stripping
    let rawContent = completion.choices[0]?.message?.content || "{}";

    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    rawContent = rawContent.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (parseErr) {
      console.warn("[DM_GEN] Initial JSON.parse failed, attempting extraction. Raw:", rawContent);
      // Try to extract JSON object from surrounding text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedJson = JSON.parse(jsonMatch[0]);
        } catch (innerErr) {
          console.error("[DM_GEN] JSON extraction also failed:", innerErr);
          throw new Error("AI returned malformed JSON. Please try again.");
        }
      } else {
        throw new Error("AI returned non-JSON response. Please try again.");
      }
    }
    
    // 4. Validate output before deducting credits
    if (!parsedJson.messageBody || typeof parsedJson.messageBody !== 'string' || parsedJson.messageBody.trim() === "") {
      throw new Error("AI generation failed or returned empty text");
    }

    // 5. Deduct Credits safely
    const creditResult = await consumeCredits(activeUser.id, "DM_GENERATION");
    if (!creditResult.success) {
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 402 });
    }

    // 6. Return standard synchronous payload with generatedText
    return NextResponse.json({ 
      success: true,
      generatedText: parsedJson.messageBody,
      messageBody: parsedJson.messageBody,
      toneDetected: parsedJson.toneDetected || tone,
      campaignTags: parsedJson.campaignTags || [],
      creditsRemaining: creditResult.remainingCredits,
    }, { status: 200 });

  } catch (error: any) {
    console.error("[DM_GENERATION_ERROR] Unhandled exception:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
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

