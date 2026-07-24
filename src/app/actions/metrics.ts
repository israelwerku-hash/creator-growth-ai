"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/utils/supabase/server";
import { db as prisma } from "@/lib/db";

export async function saveMetricAction(formData: FormData) {
  try {
    // 🔐 1. AUTHENTICATION PROTECTION
    const session = await getSession().catch(() => null);
    
    if (!session?.user?.id) {
      throw new Error("401 Unauthorized: Valid session required to log metrics.");
    }
    const userId = session.user.id;

    // 📋 2. PARSE FORM SUBMISSION PAYLOADS
    const name = formData.get("name") as string;
    const rawValue = formData.get("value") as string;
    const platform = formData.get("platform") as string;

    if (!name || !rawValue || !platform) {
      throw new Error("Validation failure: All fields are strictly required.");
    }

    // Clean out commas or spaces so a user typing "145,000" converts cleanly to a true number
    const numericalValue = parseFloat(rawValue.replace(/,/g, "").trim());
    if (isNaN(numericalValue)) {
      throw new Error("Invalid format: Metric value must resolve to a valid numerical number.");
    }

    // 🛡️ 3. CREDIT GATEKEEPER CHECK
    const { consumeCredits } = await import("@/utils/credits");
    const creditCheck = await consumeCredits("DATA_METRIC_LOGGER");
    
    if (!creditCheck.success) {
      // ⚠️ Return clean error object to trigger client-side paywall UI
      return { success: false, error: creditCheck.error };
    }

    // 💾 4. SAVE DIRECTLY INTO SUPABASE VIA PRISMA
    await prisma.metric.create({
      data: {
        name,
        value: String(numericalValue),
        platform,
        creatorId: userId, // Links directly to your PRO creator row
      },
    });

    console.log(`📊 Successfully logged metric "${name}". Remaining credits: ${creditCheck.remainingCredits}`);

    // 🔄 5. REFRESH SERVER STATE CACHES instantly on the active dashboard screen
    revalidatePath("/dashboard");
    
    return { success: true, remainingCredits: creditCheck.remainingCredits };
  } catch (error: any) {
    console.error("❌ Failed to log server metric entry:", error.message || error);
    return { success: false, error: error.message || "Internal Database Insertion Failure" };
  }
}