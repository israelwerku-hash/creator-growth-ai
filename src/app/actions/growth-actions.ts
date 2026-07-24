"use server";

import { db } from "@/lib/db"; // Adjust this import path if your Prisma instance is exported differently
import { revalidatePath } from "next/cache";
import { getSession } from "@/utils/supabase/server";

export async function addGrowthMetric(formData: FormData) {
  const metricName = formData.get("metricName") as string;
  const rawValue = formData.get("value") as string;
  const platform = (formData.get("platform") as string) || "OnlyFans";

  if (!metricName || !rawValue) {
    throw new Error("Missing required form fields.");
  }

  try {
    // 1. Enforce Authentication
    const session = await getSession().catch(() => null);
    if (!session?.user?.id) {
      throw new Error("401 Unauthorized: Session missing or invalid.");
    }
    const creatorId = session.user.id;

    // 2. Parse value securely
    const numericValue = parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0;

    // 3. Create the metric record matching our exact schema rules
    await db.metric.create({
      data: {
        creatorId: creatorId,
        platform: platform,
        // Map the numeric value based on what kind of metric it is
        views: metricName.toLowerCase().includes("view") ? Math.floor(numericValue) : 0,
        earnings: metricName.toLowerCase().includes("earn") || metricName.includes("$") ? numericValue : 0,
        date: new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Write Failure:", error);
    return { success: false, error: "Failed to log metric to database." };
  }
}