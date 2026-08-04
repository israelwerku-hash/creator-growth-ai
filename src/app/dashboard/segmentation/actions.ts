"use server";

import { revalidatePath } from "next/cache";
import { executeFanSegmentationAI } from "@/services/aiSegmentation"; 
import { consumeCredits } from "@/utils/credits";

import { getSession } from "@/utils/supabase/server";

export async function reanalyzeFanAction(fanId: string) {
  try {
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const creditResult = await consumeCredits(userId, "SEGMENTATION");
    if (!creditResult.success) {
      return { success: false, error: creditResult.error || "Insufficient credits." };
    }

    // Run the actual AI logic
    await executeFanSegmentationAI(fanId);
    
    // Instantly update the UI Header for credits
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    return { success: false, error: error.message };
  }
}