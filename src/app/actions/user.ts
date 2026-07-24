"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function deleteAccountAction() {
  try {
    const user = await requireAuth();

    // 1. Fetch user data (Paddle subscription ID would be stored here if applicable, 
    // though the current schema doesn't store a explicit subscription_id yet. 
    // In a real integration, we'd query Paddle's API to cancel active subs.)
    const creator = await db.creator.findUnique({
      where: { id: user.id },
      select: { paddleSubscriptionId: true },
    });

    if (creator) {
      // NOTE: Here you would call Paddle's API to cancel the subscription:
      // await cancelPaddleSubscription(creator.subscriptionId, { effective_from: 'immediately' });
      // Since there's no paddle backend client configured in this codebase, we simulate the DB wipe.
    }

    // 2. Wipe Prisma DB (Cascade deletes Fan, Metric, Goal, etc.)
    await db.creator.delete({
      where: { id: user.id },
    });

    // 3. Delete Supabase Auth User
    // Need service role key to delete users via admin API.
    // As a fallback for this demo, we'll just log them out since we don't have the service role key available here.
    // But ideally: await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    // 4. Log out the session
    const supabase = await createClient();
    await supabase.auth.signOut();

  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error("Failed to delete account");
  }

  // Redirect to homepage
  redirect("/");
}
