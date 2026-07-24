"use server";

import Groq from "groq-sdk";
import { consumeCredits } from "@/utils/credits";
import { revalidatePath } from "next/cache";

export async function translateTextAction(text: string, language: string) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GROQ_API_KEY is not set." };
    }

    // 1. Consume 15 credits for Translation
    const creditResult = await consumeCredits("LANGUAGE_TRANSLATOR");
    
    if (!creditResult.success) {
      return { success: false, error: creditResult.error || "Insufficient credits." };
    }

    // 2. Refresh the UI to show new credit balance instantly
    try {
      revalidatePath("/", "layout");
    } catch {}

    // 3. Initialize SDK and make the call
    const groq = new Groq({ apiKey });
    const prompt = `Translate the following text into ${language}. Maintain the exact original tone, formatting, and intent. Do not add any introductory text or quotes. Output ONLY the translated text.\n\nText:\n${text}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    if (!responseText) throw new Error("Groq returned an empty response");

    return { success: true, text: responseText.trim() };
  } catch (error: any) {
    console.error("Translation Error:", error);
    return { success: false, error: error.message || "Failed to generate translation." };
  }
}
