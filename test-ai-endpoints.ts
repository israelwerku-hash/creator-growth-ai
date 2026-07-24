import { z } from "zod";
import Groq from "groq-sdk";
import { config } from "dotenv";
config();

if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in .env");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const model = "llama-3.1-8b-instant"; // Testing Tier 1

async function runTest(name: string, prompt: string, schema: z.ZodTypeAny) {
  process.stdout.write(`Testing [${name}]... `);
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });
    
    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsedJson = JSON.parse(responseText);
    
    const validationResult = schema.safeParse(parsedJson);
    if (!validationResult.success) {
      console.log(`❌ FAILED (Zod Validation Error)`);
      console.log(validationResult.error.message);
      console.log("Raw Output:", parsedJson);
      return false;
    }
    
    console.log(`✅ 200 OK (Valid JSON Generated)`);
    return true;
  } catch (error: any) {
    console.log(`❌ FAILED (Groq API Error)`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log("=========================================");
  console.log("🚀 STARTING FULL AI ENDPOINT TEST LOOP");
  console.log("=========================================\n");

  let allPassed = true;

  // 1. DM Generation
  const dmSchema = z.object({
    messageBody: z.string().min(10).max(1000),
    toneDetected: z.enum(["flirty", "casual", "urgent", "promotional", "appreciative"]),
    includesCallToAction: z.boolean(),
    suggestedUnlockPrice: z.number().int().optional(),
    campaignTags: z.array(z.string()).max(3)
  });
  
  const dmPrompt = `You are an elite, high-end creator agency outreach strategist.
Your task is to generate a highly personalized, compelling, and natural-sounding direct message (DM) for an outreach campaign.
Write it as if you are sending it directly to the target. If you don't know their specific name, use a natural greeting that avoids generic brackets like [Name].

TARGET INDUSTRY / ACCOUNT: Music Producers
CAMPAIGN GOAL: Sell latest premium drum kit pack
TONE & VIBE: casual
CONTEXT / HOOK: Noticed they liked my recent beat making video

CRITICAL RULES:
1. The message must perfectly match the requested tone and vibe.
2. Keep it concise, punchy, and highly readable (maximum 150 words).
3. Do not include any meta-commentary, introductory text, or quotation marks.
4. You MUST return your entire response as a valid JSON object matching the following structure:
{
  "messageBody": "The actual DM message",
  "toneDetected": "Must be ONE of: flirty, casual, urgent, promotional, appreciative",
  "includesCallToAction": true or false,
  "campaignTags": ["tag1", "tag2", "tag3"]
}
Return ONLY valid JSON.`;

  allPassed = await runTest("generate-dm", dmPrompt, dmSchema) && allPassed;

  // 2. AI Segmentation
  const segSchema = z.object({
    segments: z.array(z.enum([
      "whale", "active_spender", "lurker", "churn_risk", "new_lead", "highly_engaged"
    ])).max(3),
    engagementScore: z.number().int().min(0).max(100),
    segmentationReasoning: z.string().max(150).optional()
  });

  const segPrompt = `You are an elite OnlyFans CRM AI. Analyze this fan's chat history and spending behavior to determine their marketing segment.
Chat History: "User keeps liking photos but hasn't bought any PPVs in the last 3 months."
Spending Data: Total spend: $15. Last purchase: 90 days ago.

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

  allPassed = await runTest("ai-segmentation", segPrompt, segSchema) && allPassed;

  // 3. Language Translator
  const transSchema = z.object({
    translatedText: z.string().min(1),
    detectedLanguage: z.string(),
    confidenceScore: z.number().min(0).max(1),
    translationNotes: z.string().optional()
  });

  const transPrompt = `You are an expert translator specializing in casual, flirty, and colloquial language (e.g., OnlyFans interactions).
Translate the following text into Spanish. Capture the exact tone and nuance of the original message.

TEXT TO TRANSLATE:
"Hey baby, miss me? Buy my new video and I'll send you a special surprise."

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

  allPassed = await runTest("language-translator", transPrompt, transSchema) && allPassed;

  // 4. Memory Vault
  const memSchema = z.object({
    fanSummary: z.string().max(200),
    keyInterests: z.array(z.string()).max(5),
    spendingSentiment: z.enum(["high_roller", "hesitant", "window_shopper", "unknown"]),
    extractedFacts: z.array(z.string()).max(10),
    suggestedAction: z.string().optional()
  });

  const memPrompt = `You are an elite OnlyFans CRM analyst. Analyze this chat history and extract memory vault data.
Chat History: "Fan: I really loved the yoga video you posted! Do you do custom requests? I'd pay $100 for a 5 min personalized stretching routine."

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

  allPassed = await runTest("memory-vault", memPrompt, memSchema) && allPassed;

  console.log("\n=========================================");
  if (allPassed) {
    console.log("🎉 SUCCESS: ALL AI ENDPOINTS VERIFIED & FUNCTIONAL");
  } else {
    console.log("⚠️ WARNING: SOME TESTS FAILED. CHECK LOGS.");
  }
  console.log("=========================================");
}

main();
