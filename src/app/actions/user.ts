"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  try {
    const user = await requireAuth();

    // 1. Fetch membership ID for Whop cancellation
    const creator = await db.creator.findUnique({
      where: { id: user.id },
      select: { paddleSubscriptionId: true },
    });

    if (creator?.paddleSubscriptionId) {
      // Cancel Whop membership via API
      const whopApiKey = process.env.WHOP_API_KEY;
      if (whopApiKey) {
        try {
          await fetch(`https://api.whop.com/api/v2/memberships/${creator.paddleSubscriptionId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${whopApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "cancel" }),
          });
          console.log(`[deleteAccountAction] Whop membership cancelled: ${creator.paddleSubscriptionId}`);
        } catch (whopErr) {
          console.error("[deleteAccountAction] Whop cancellation failed (non-fatal):", whopErr);
        }
      }
    }

    // 2. Wipe Prisma DB (Cascade deletes Fan, Metric, Goal, etc.)
    await db.creator.delete({
      where: { id: user.id },
    });

    // 3. Log out the session
    const supabase = await createClient();
    await supabase.auth.signOut();

  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error("Failed to delete account");
  }

  // Redirect to homepage
  redirect("/");
}
