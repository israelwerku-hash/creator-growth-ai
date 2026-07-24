import { NextResponse } from "next/server";
import { getSession } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

// Force Node.js runtime for Supabase auth admin / db execution
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Database Lookup for paddleSubscriptionId
    const creator = await db.creator.findUnique({
      where: { id: userId },
      select: { paddleSubscriptionId: true }
    });

    const subId = creator?.paddleSubscriptionId;

    // 2. Paddle Cancellation (if subscription exists)
    if (subId) {
      console.log(`[Account Deletion] Attempting to cancel Paddle subscription: ${subId}`);
      
      const paddleApiKey = process.env.PADDLE_API_KEY;
      const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "api" : "sandbox-api";
      
      if (paddleApiKey) {
        try {
          const paddleRes = await fetch(`https://${paddleEnv}.paddle.com/subscriptions/${subId}/cancel`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${paddleApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ effective_from: "immediately" }),
          });

          if (!paddleRes.ok) {
            const errorText = await paddleRes.text();
            console.warn(`[Account Deletion] Paddle cancellation returned non-OK status: ${paddleRes.status}`, errorText);
            // We proceed with deletion even if Paddle cancellation fails (e.g. if the sub was already cancelled)
          } else {
            console.log(`✅ [Account Deletion] Paddle subscription ${subId} successfully cancelled.`);
          }
        } catch (paddleError) {
          console.error(`[Account Deletion] Paddle cancellation exception:`, paddleError);
          // Again, proceed with deletion to ensure the user isn't trapped
        }
      } else {
        console.warn(`[Account Deletion] PADDLE_API_KEY missing! Could not cancel subscription ${subId}.`);
      }
    }

    // 3. Database Purge (Cascading)
    console.log(`[Account Deletion] Purging Prisma database records for user: ${userId}`);
    await db.creator.delete({
      where: { id: userId },
    });
    console.log(`✅ [Account Deletion] Prisma records purged successfully.`);

    // 4. Supabase Auth Purge
    console.log(`[Account Deletion] Purging Supabase Auth user: ${userId}`);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[Account Deletion] Supabase Service Role Key missing! Cannot delete Auth user.`);
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(`[Account Deletion] Supabase Auth deletion failed:`, authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    console.log(`✅ [Account Deletion] Supabase Auth user deleted successfully. End-to-end flow complete.`);

    return NextResponse.json({ success: true, deletedUserId: userId });
  } catch (error: any) {
    console.error("[Account Deletion] Unexpected endpoint error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
