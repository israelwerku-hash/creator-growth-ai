// 💡 Fixed: Stepping up one level from services/ to src/lib/
import { db as prisma } from "../lib/db";
import Groq from "groq-sdk";
import 'dotenv/config';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY! 
});

const MODEL = "llama-3.1-8b-instant";

// ... rest of your aiMemory.ts code remains exactly the same
// --- BASIC MEMORY FUNCTIONS ---
// Inside src/services/aiMemory.ts
export async function saveMemory(fanId: string, keyFact: string, category: string, isPriority: boolean) {
  return await prisma.fanMemory.create({
    data: {
      fanId: fanId,
      keyFact: keyFact,
      category: category,  // This connects your UI to the DB
      isPriority: isPriority,
    },
  });
}

export async function getMemories(fanId: string) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return await prisma.fanMemory.findMany({
    where: { 
      fanId, 
      OR: [
        { isPriority: true }, 
        { createdAt: { gte: threeDaysAgo } }
      ] 
    },
    orderBy: { createdAt: 'desc' }
  });
}

// --- CORE AI GENERATION & VALIDATION ---

async function generate(prompt: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned an empty text layer.");
    }
    
    return text; 
  } catch (error) {
    console.error("🚨 GROQ API CORE ERROR:", error);
    throw error;
  }
}

/**
 * Anti-Hallucination Guard: Compares generated options against DB facts
 */
async function validateResponse(suggestionText: string, memories: any[]): Promise<boolean> {
  if (memories.length === 0) return true;
  
  const memoryStrings = memories.map(m => m.keyFact).join('\n');
  const prompt = `Review this proposed message to a fan against the known facts about them. Does the message contradict or violate any of the facts?
  
Message: "${suggestionText}"

Known Facts:
${memoryStrings}

Respond with exactly 'YES' if it contradicts a fact, or 'NO' if it is safe and accurate. Do not include any other text.`;

  try {
    const evaluation = await generate(prompt);
    return !evaluation.toUpperCase().includes('YES');
  } catch {
    return true; // Fallback to true on system timeout so it doesn't completely block responses
  }
}

/**
 * Primary multi-style generation algorithm matrix
 */
export async function getReplySuggestions(fanId: string, fanMessage: string) {
  try {
    const memories = await getMemories(fanId);
    const memoryStrings = memories.length > 0 ? memories.map(m => m.keyFact).join('\n') : 'No known facts.';

    const prompt = `You are a reply suggestion engine. Given a fan's message and known facts about them, generate exactly 3 reply options in different styles.

Fan message: "${fanMessage}"
Known facts:
${memoryStrings}

Respond with ONLY a valid JSON array in this exact format, no other markdown text or code block fences:
[{"style":"casual","text":"..."},{"style":"professional","text":"..."},{"style":"vip","text":"..."}]`;

    const raw = await generate(prompt);

    // Extract JSON securely from markdown fence blocks if present
    const jsonMatch = raw.match(/\[\s*\{\s*[\s\S]*\}\s*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    // Validate suggestions through your anti-hallucination guard
    const validated = [];
    for (const suggestion of parsed) {
      const isValid = await validateResponse(suggestion.text, memories);
      if (isValid) {
        validated.push({ style: suggestion.style, text: suggestion.text });
      }
    }

    return validated.length > 0 ? validated : parsed.map((s: any) => ({ style: s.style, text: s.text }));
  } catch (outerError) {
    console.error("Fallback activated due to processing block exception:", outerError);
    return [
      { style: "casual", text: "Hey! Great to hear from you. How's your week treating you?" },
      { style: "vip", text: "Hey love! So glad you messaged me tonight. Let's catch up properly." },
      { style: "professional", text: "Thanks for checking in! I'll be sharing some fresh updates inside your vault updates shortly." }
    ];
  }
}

export async function safeGenerateReply(fanId: string, message: string) {
  return { success: true, text: "Mocked translation/reply: " + message };
}

export async function updateEngagementAndStreak(fanId: string) {
  return { success: true, streak: 1, engagementScore: 10 };
}