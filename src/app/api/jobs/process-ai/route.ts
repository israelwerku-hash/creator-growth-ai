import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { redis } from "@/lib/redis";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const DmGenerationSchema = z.object({
  messageBody: z.string().min(10, "Message is too short").max(1000, "Message exceeds character limits"),
  toneDetected: z.enum(["flirty", "casual", "urgent", "promotional", "appreciative"]),
  includesCallToAction: z.boolean(),
  suggestedUnlockPrice: z.number().int().optional(),
  campaignTags: z.array(z.string()).max(3)
});

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

async function handler(req: Request) {
  let jobId = "unknown";
  let userId = "unknown";

  try {
    const body = await req.json();
    jobId = body.jobId;
    userId = body.userId;
    const { targetAccount, campaignGoal, tone, context, fanId, creditsRemaining } = body;

    if (!jobId || !userId) {
      throw new Error("Missing jobId or userId in QStash payload");
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("AI Engine is not configured on the server.");
    }
    const groq = new Groq({ apiKey });

    // --- Fetch Fan Memories from Vault ---
    let fanMemoriesSection = "";
    if (fanId) {
      try {
        const fan = await db.fan.findFirst({
          where: { 
            OR: [{ id: fanId }, { username: fanId }],
            creatorId: userId
          }
        });

        const resolvedFanId = fan ? fan.id : fanId;

        const memories = await db.fanMemory.findMany({
          where: { fanId: resolvedFanId },
          orderBy: { createdAt: 'desc' }
        });

        if (memories.length > 0) {
          const facts = memories.map((m: any) => `- ${m.keyFact}`).join("\n");
          fanMemoriesSection = `\n\nFAN MEMORIES & PREFERENCES (CRITICAL — you MUST incorporate these into your message):\n${facts}`;
        }
      } catch (memErr: any) {
        console.error("[QSTASH_VAULT_ERROR]", memErr.message);
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
      // --- TIER 1 ---
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const parsedJson = JSON.parse(completion.choices[0]?.message?.content || "{}");
      const validationResult = DmGenerationSchema.safeParse(parsedJson);
      if (!validationResult.success) throw new ValidationError("Tier 1 Zod validation failed");
      validatedData = validationResult.data;

    } catch (tier1Error: any) {
      Sentry.captureException(tier1Error, { tags: { fallback: "tier_2_triggered" } });
      
      try {
        // --- TIER 2 ---
        const completionTier2 = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });
        
        const parsedJsonTier2 = JSON.parse(completionTier2.choices[0]?.message?.content || "{}");
        const validationResultTier2 = DmGenerationSchema.safeParse(parsedJsonTier2);
        if (!validationResultTier2.success) throw new ValidationError("Tier 2 Zod validation failed");
        validatedData = validationResultTier2.data;

      } catch (tier2Error: any) {
        throw tier2Error;
      }
    }

    // --- Success: Update Redis ---
    await redis.set(`job:${jobId}`, JSON.stringify({
      status: "COMPLETED",
      result: {
        success: true,
        output: validatedData.messageBody,
        messageBody: validatedData.messageBody,
        toneDetected: validatedData.toneDetected,
        includesCallToAction: validatedData.includesCallToAction,
        campaignTags: validatedData.campaignTags,
        remainingCredits: creditsRemaining,
        creditsRemaining: creditsRemaining,
      }
    }), { ex: 3600 });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("[QStash Worker Error]:", error.message);
    Sentry.captureException(error);
    
    // --- Failure: Refund & Update Redis ---
    if (userId !== "unknown") {
      try {
        await db.creator.update({
          where: { id: userId },
          data: { aiCredits: { increment: 1 } },
        });
      } catch (refundErr) {
        console.error("Failed to refund credit:", refundErr);
      }
    }
    
    if (jobId !== "unknown") {
      await redis.set(`job:${jobId}`, JSON.stringify({
        status: "FAILED",
        error: error.message || "Unknown error during AI generation",
      }), { ex: 3600 });
    }

    // Return 200 even on failure to avoid QStash retrying infinitely unless we want retries.
    // Given we refunded, we should NOT retry. Returning 200 drops the message.
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}

export const POST = verifySignatureAppRouter(handler);

