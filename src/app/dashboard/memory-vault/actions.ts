"use server";

// 💡 Fixed: Stepping out of app router back to src/lib/
import { executeFanSegmentationAI } from "../../../services/aiSegmentation";
import { db as prisma } from "../../../lib/db";
import { getSession } from "@/utils/supabase/server";
import { saveMemory, getMemories, getReplySuggestions } from "../../../services/aiMemory";
import { consumeCredits } from "@/utils/credits";
import { revalidatePath } from "next/cache";

export async function getFansAction() {
  try {
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id ?? "user_test_12345"; 

    console.log("Fetching fans for Creator ID:", userId); // 👈 ADD THIS

    const fans = await prisma.fan.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        displayName: true,
        username: true,
      },
      orderBy: { createdAt: "desc" }
    });

    console.log("Fans found in DB:", fans); // 👈 ADD THIS
    return fans;
  } catch (error) {
    console.error("Error in getFansAction:", error);
    return [];
  }
}

// ... rest of your actions.ts code remains exactly the same

export async function getFanMemoriesAction(fanId: string) {
  try {
    if (!fanId) return [];
    return await getMemories(fanId);
  } catch (error) {
    console.error("Error in getFanMemoriesAction:", error);
    return [];
  }
}

export async function addFanMemoryAction(fanId: string, keyFact: string, category: string, isPriority: boolean) {
  try {
    if (!fanId || !keyFact) throw new Error("Missing required payload parameters.");
    return await saveMemory(fanId, keyFact, category, isPriority);
  } catch (error) {
    console.error("Error in addFanMemoryAction:", error);
    throw error;
  }
}


export async function generateAISuggestionsAction(fanId: string, fanMessage: string) {
  try {
    if (!fanId || !fanMessage) throw new Error("Missing context fields for generation.");

    const session = await getSession().catch(() => null);
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const creditResult = await consumeCredits(userId, "MEMORY_VAULT");
    if (!creditResult.success) {
      throw new Error(creditResult.error || "Insufficient credits.");
    }

    const suggestions = await getReplySuggestions(fanId, fanMessage);
    
    // Instantly update the UI Header for credits
    revalidatePath("/", "layout");
    
    return suggestions;
  } catch (error) {
    console.error("Error in generateAISuggestionsAction:", error);
    return [
      { style: "casual", text: "Hey! Great to hear from you. How's your week treating you?" },
      { style: "vip", text: "Hey love! So glad you messaged me tonight. Let's catch up properly." },
      { style: "professional", text: "Thanks for checking in! I'll be sharing some fresh updates inside your vault updates shortly." }
    ];
  }
}export async function segmentFanAction(fanId: string) {
  try {
    if (!fanId) throw new Error("Fan ID is required for segmentation.");
    // This calls the service that talks to the AI
    return await executeFanSegmentationAI(fanId);
  } catch (error) {
    console.error("Error in segmentFanAction:", error);
    throw error;
  }
}